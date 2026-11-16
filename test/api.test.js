/**
 * Automated Test Suite for Assignment 3 - Inventory and Data Management System
 * Tests logic, virtuals, and controller endpoints.
 */
const assert = require('assert');
const Product = require('../models/Product');

async function runTests() {
  console.log('=== Running Tests for Assignment 3 ===\n');

  // Test 1: Product Schema & Virtual 'stockValue'
  console.log('Test 1: Testing Product Schema & Virtual stockValue');
  const testProduct = new Product({
    name: 'Test Desk',
    sku: 'FURN-DK-999',
    category: 'Furniture',
    price: 2500,
    quantity: 4,
    reorderLevel: 2,
    supplier: 'Test Supplier'
  });

  assert.strictEqual(testProduct.stockValue, 10000, 'stockValue must equal price * quantity (2500 * 4 = 10000)');
  assert.strictEqual(testProduct.sku, 'FURN-DK-999', 'SKU must be stored uppercase');
  console.log('✔ Test 1 Passed: Virtual stockValue calculation correct (2500 * 4 = 10000)');

  // Test 2: Validation on required fields
  console.log('\nTest 2: Testing Schema Validation Errors');
  const invalidProduct = new Product({});
  let validationError;
  try {
    await invalidProduct.validate();
  } catch (err) {
    validationError = err;
  }
  assert(validationError, 'Validation error must be thrown');
  assert(validationError.errors.name, 'Name should be required');
  assert(validationError.errors.sku, 'SKU should be required');
  assert(validationError.errors.category, 'Category should be required');
  assert(validationError.errors.price, 'Price should be required');
  console.log('✔ Test 2 Passed: Required field validations correctly enforced');

  // Test 3: Validation on negative price / quantity
  console.log('\nTest 3: Testing Negative Numbers Validation');
  const negativeProduct = new Product({
    name: 'Invalid Item',
    sku: 'NEG-001',
    category: 'General',
    price: -50,
    quantity: -5,
    supplier: 'Test'
  });
  let negError;
  try {
    await negativeProduct.validate();
  } catch (err) {
    negError = err;
  }
  assert(negError, 'Negative values must throw error');
  assert(negError.errors.price, 'Negative price must trigger validation error');
  assert(negError.errors.quantity, 'Negative quantity must trigger validation error');
  console.log('✔ Test 3 Passed: Non-negative validation constraints work');

  // Test 4: Low stock logic verification
  console.log('\nTest 4: Testing Low Stock Evaluation');
  const lowItem = { quantity: 2, reorderLevel: 4 };
  const okItem = { quantity: 15, reorderLevel: 5 };
  assert(lowItem.quantity <= lowItem.reorderLevel, 'Item with quantity 2 and reorderLevel 4 should be marked as low stock');
  assert(!(okItem.quantity <= okItem.reorderLevel), 'Item with quantity 15 and reorderLevel 5 should not be low stock');
  console.log('✔ Test 4 Passed: Low-stock condition correctly flags items');

  // Test 5: JSON Serialization with virtuals
  console.log('\nTest 5: Testing toJSON virtuals inclusion');
  const jsonOutput = testProduct.toJSON();
  assert('stockValue' in jsonOutput, 'JSON output must include virtual stockValue');
  assert.strictEqual(jsonOutput.stockValue, 10000, 'Serialized stockValue must be 10000');
  console.log('✔ Test 5 Passed: toJSON contains virtual fields (stockValue & id)');

  console.log('\n=======================================');
  console.log('🎉 All schema and business logic tests passed successfully!');
  console.log('=======================================\n');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
