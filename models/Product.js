const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters']
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 0,
      min: [0, 'Quantity cannot be negative']
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      default: 0,
      min: [0, 'Reorder level cannot be negative']
    },
    supplier: {
      type: String,
      required: [true, 'Supplier is required'],
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field: stockValue = price * quantity
productSchema.virtual('stockValue').get(function () {
  return (this.price || 0) * (this.quantity || 0);
});

// Create indexes for efficient querying and aggregation
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', sku: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
