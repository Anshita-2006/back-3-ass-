require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');

const sampleProducts = [
  // Furniture
  {
    name: 'Study Table',
    sku: 'FURN-TB-012',
    category: 'Furniture',
    price: 3999,
    quantity: 2,
    reorderLevel: 4,
    supplier: 'IKEA India'
  },
  {
    name: 'Ergonomic Office Chair',
    sku: 'FURN-CH-104',
    category: 'Furniture',
    price: 6499,
    quantity: 15,
    reorderLevel: 5,
    supplier: 'Green Soul'
  },

  // Stationery
  {
    name: 'Gel Pen Pack of 10',
    sku: 'STNY-PN-713',
    category: 'Stationery',
    price: 120,
    quantity: 40,
    reorderLevel: 20,
    supplier: 'Cello Pens'
  },
  {
    name: 'A4 Spiral Notebook',
    sku: 'STNY-NB-205',
    category: 'Stationery',
    price: 85,
    quantity: 120,
    reorderLevel: 30,
    supplier: 'Classmate'
  },

  // Electronics (4 items)
  {
    name: 'Wireless Bluetooth Earbuds',
    sku: 'ELEC-EB-301',
    category: 'Electronics',
    price: 1999,
    quantity: 50,
    reorderLevel: 15,
    supplier: 'boAt Lifestyle'
  },
  {
    name: 'Mechanical Gaming Keyboard',
    sku: 'ELEC-KB-502',
    category: 'Electronics',
    price: 3499,
    quantity: 1,
    reorderLevel: 5,
    supplier: 'Redragon'
  },
  {
    name: 'Gaming Mouse 7200 DPI',
    sku: 'ELEC-MS-409',
    category: 'Electronics',
    price: 1249,
    quantity: 3,
    reorderLevel: 5,
    supplier: 'Logitech India'
  },
  {
    name: '24-Inch Full HD Monitor',
    sku: 'ELEC-MN-880',
    category: 'Electronics',
    price: 8999,
    quantity: 25,
    reorderLevel: 10,
    supplier: 'Samsung India'
  },

  // Apparel (2 items)
  {
    name: 'Cotton Casual Shirt',
    sku: 'APPR-SH-601',
    category: 'Apparel',
    price: 1199,
    quantity: 5,
    reorderLevel: 10,
    supplier: 'Allen Solly'
  },
  {
    name: 'Slim Fit Denim Jeans',
    sku: 'APPR-JN-602',
    category: 'Apparel',
    price: 1599,
    quantity: 45,
    reorderLevel: 15,
    supplier: 'Levi Strauss India'
  },

  // Books (2 items)
  {
    name: 'Clean Code: Handbook of Agile Software Craftsmanship',
    sku: 'BOOK-CC-001',
    category: 'Books',
    price: 650,
    quantity: 20,
    reorderLevel: 5,
    supplier: 'Pearson Education'
  },
  {
    name: 'Designing Data-Intensive Applications',
    sku: 'BOOK-DD-002',
    category: 'Books',
    price: 1450,
    quantity: 12,
    reorderLevel: 5,
    supplier: "O'Reilly Media"
  }
];

const seedDB = async () => {
  try {
    await connectDB();

    console.log('Clearing existing product collection...');
    await Product.deleteMany({});

    console.log(`Inserting ${sampleProducts.length} sample products...`);
    const inserted = await Product.insertMany(sampleProducts);

    console.log(`Successfully seeded ${inserted.length} products!`);
    console.log('\nSample Seeded Products:');
    inserted.forEach((p) => {
      console.log(` - [${p.sku}] ${p.name} (${p.category}) - Price: Rs.${p.price}, Qty: ${p.quantity}, StockValue: Rs.${p.stockValue}`);
    });

    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });
    console.log(`\nLow stock items count: ${lowStockCount}`);

    const categoriesCount = (await Product.distinct('category')).length;
    console.log(`Distinct categories count: ${categoriesCount}`);

    await mongoose.connection.close();
    console.log('\nMongoDB connection closed. Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedDB();
