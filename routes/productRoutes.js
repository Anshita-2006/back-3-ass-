const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateStock,
  deleteProduct,
  getLowStockProducts,
  getInventorySummary
} = require('../controllers/productController');

// Reports and summaries (MUST be before /:id)
router.get('/low-stock', getLowStockProducts);
router.get('/summary', getInventorySummary);

// CRUD routes
router.route('/')
  .post(createProduct)
  .get(getAllProducts);

router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

// Stock adjustment route
router.patch('/:id/stock', updateStock);

module.exports = router;
