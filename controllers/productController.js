const Product = require('../models/Product');

// @desc    Create a new product
// @route   POST /api/products
// @access  Public
const createProduct = async (req, res, next) => {
  try {
    const { name, sku, category, price, quantity, reorderLevel, supplier } = req.body;

    const product = await Product.create({
      name,
      sku,
      category,
      price,
      quantity,
      reorderLevel,
      supplier
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      minPrice,
      maxPrice,
      supplier,
      inStock,
      sortBy
    } = req.query;

    const query = {};

    // Filter by Category
    if (category) {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    // Filter by Supplier
    if (supplier) {
      query.supplier = { $regex: new RegExp(`^${supplier.trim()}$`, 'i') };
    }

    // Search by Name or SKU
    if (search) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { sku: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Filter by Price Range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Filter by Stock Status
    if (inStock === 'true') {
      query.quantity = { $gt: 0 };
    } else if (inStock === 'false') {
      query.quantity = { $lte: 0 };
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy) {
      // Supports formats: 'price:asc', 'price:desc', 'name', '-price'
      if (sortBy.includes(':')) {
        const [field, order] = sortBy.split(':');
        sortOptions = { [field]: order.toLowerCase() === 'desc' ? -1 : 1 };
      } else if (sortBy.startsWith('-')) {
        sortOptions = { [sortBy.substring(1)]: -1 };
      } else {
        sortOptions = { [sortBy]: 1 };
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      total,
      page: pageNum,
      totalPages,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update product details
// @route   PUT /api/products/:id
// @access  Public
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Stock adjustment (increment or decrement safely)
// @route   PATCH /api/products/:id/stock
// @access  Public
const updateStock = async (req, res, next) => {
  try {
    const { change } = req.body;

    if (change === undefined || typeof change !== 'number' || isNaN(change)) {
      res.status(400);
      throw new Error("Field 'change' is required and must be a number");
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    if (product.quantity + change < 0) {
      res.status(400);
      throw new Error(
        `Insufficient stock: Cannot decrement quantity (${product.quantity}) by ${Math.abs(change)} below 0`
      );
    }

    product.quantity += change;
    await product.save();

    res.status(200).json({
      message: 'Stock updated',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Public
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.status(200).json({
      message: 'Product deleted',
      id: req.params.id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low-stock alert report (quantity <= reorderLevel)
// @route   GET /api/products/low-stock
// @access  Public
const getLowStockProducts = async (req, res, next) => {
  try {
    const lowStockItems = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });

    res.status(200).json({
      count: lowStockItems.length,
      lowStockItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise inventory summary using aggregation pipeline
// @route   GET /api/products/summary
// @access  Public
const getInventorySummary = async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          avgPrice: { $avg: '$price' }
        }
      },
      {
        $project: {
          _id: 1,
          totalItems: 1,
          totalQuantity: 1,
          totalStockValue: 1,
          avgPrice: { $round: ['$avgPrice', 2] }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      categories: summary.length,
      summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateStock,
  deleteProduct,
  getLowStockProducts,
  getInventorySummary
};
