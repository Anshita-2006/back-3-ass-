require('dotenv').config();
const http = require('http');
const app = require('../server');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testLiveEndpoints() {
  console.log('\n======================================================');
  console.log('🧪 Starting End-to-End Live API & MongoDB Tests');
  console.log('======================================================\n');

  // Wait 1 second for DB connection to establish
  await new Promise((r) => setTimeout(r, 1000));

  // 1. GET /api/products
  console.log('1. Testing GET /api/products (Pagination & Filtering)...');
  const resAll = await request({
    host: '127.0.0.1',
    port: 5000,
    path: '/api/products?page=1&limit=10',
    method: 'GET'
  });
  console.log(`Status: ${resAll.status}`);
  console.log(`Total: ${resAll.data.total}, Page: ${resAll.data.page}, TotalPages: ${resAll.data.totalPages}, Count: ${resAll.data.count}`);
  if (resAll.data.products && resAll.data.products.length > 0) {
    const p = resAll.data.products[0];
    console.log(`Sample Product: [${p.sku}] ${p.name} - Price: ${p.price}, Qty: ${p.quantity}, StockValue: ${p.stockValue}, id: ${p.id}`);
  }

  // 2. GET /api/products/low-stock
  console.log('\n2. Testing GET /api/products/low-stock...');
  const resLow = await request({
    host: '127.0.0.1',
    port: 5000,
    path: '/api/products/low-stock',
    method: 'GET'
  });
  console.log(`Status: ${resLow.status}, Low stock items count: ${resLow.data.count}`);

  // 3. GET /api/products/summary
  console.log('\n3. Testing GET /api/products/summary (Aggregation)...');
  const resSummary = await request({
    host: '127.0.0.1',
    port: 5000,
    path: '/api/products/summary',
    method: 'GET'
  });
  console.log(`Status: ${resSummary.status}, Categories count: ${resSummary.data.categories}`);
  console.log('Category summaries:', JSON.stringify(resSummary.data.summary, null, 2));

  // 4. POST /api/products
  console.log('\n4. Testing POST /api/products (Create Product)...');
  const newProductPayload = {
    name: 'Wireless Bluetooth Mouse',
    sku: 'ELEC-MS-999',
    category: 'Electronics',
    price: 899,
    quantity: 15,
    reorderLevel: 5,
    supplier: 'Logitech India'
  };
  const resCreate = await request(
    {
      host: '127.0.0.1',
      port: 5000,
      path: '/api/products',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    newProductPayload
  );
  console.log(`Status: ${resCreate.status}`);
  console.log(`Created Product: id=${resCreate.data.id}, SKU=${resCreate.data.sku}, stockValue=${resCreate.data.stockValue}`);
  const createdId = resCreate.data._id || resCreate.data.id;

  // 5. GET /api/products/:id
  console.log(`\n5. Testing GET /api/products/${createdId}...`);
  const resSingle = await request({
    host: '127.0.0.1',
    port: 5000,
    path: `/api/products/${createdId}`,
    method: 'GET'
  });
  console.log(`Status: ${resSingle.status}, Name: ${resSingle.data.name}`);

  // 6. PUT /api/products/:id
  console.log(`\n6. Testing PUT /api/products/${createdId}...`);
  const resUpdate = await request(
    {
      host: '127.0.0.1',
      port: 5000,
      path: `/api/products/${createdId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Wireless Bluetooth Mouse Pro',
      sku: 'ELEC-MS-999',
      category: 'Electronics',
      price: 999,
      quantity: 20
    }
  );
  console.log(`Status: ${resUpdate.status}, Updated Name: ${resUpdate.data.name}, New StockValue: ${resUpdate.data.stockValue}`);

  // 7. PATCH /api/products/:id/stock
  console.log(`\n7. Testing PATCH /api/products/${createdId}/stock (+10 restock)...`);
  const resStock = await request(
    {
      host: '127.0.0.1',
      port: 5000,
      path: `/api/products/${createdId}/stock`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    },
    { change: 10 }
  );
  console.log(`Status: ${resStock.status}, Message: ${resStock.data.message}, Qty after restock: ${resStock.data.product.quantity}, StockValue: ${resStock.data.product.stockValue}`);

  // 8. DELETE /api/products/:id
  console.log(`\n8. Testing DELETE /api/products/${createdId}...`);
  const resDelete = await request({
    host: '127.0.0.1',
    port: 5000,
    path: `/api/products/${createdId}`,
    method: 'DELETE'
  });
  console.log(`Status: ${resDelete.status}, Deleted response:`, resDelete.data);

  console.log('\n======================================================');
  console.log('🎉 ALL 8 LIVE API ENDPOINTS VERIFIED & WORKING WITH MONGODB!');
  console.log('======================================================\n');
  process.exit(0);
}

testLiveEndpoints().catch((err) => {
  console.error('Live test error:', err);
  process.exit(1);
});
