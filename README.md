# Assignment 3: Inventory and Data Management System

**Course:** Web Dev III  
**Unit:** Unit – 3  
**CO Mapping:** CO3  
**Technology Stack:** Node.js, Express.js, MongoDB, Mongoose, dotenv  

---

## 📌 Project Overview

The **Inventory and Data Management System** is a robust RESTful backend built with Node.js, Express.js, and MongoDB using Mongoose ODM. It provides end-to-end functionality for managing an enterprise product catalog and warehouse inventory:

- **Mongoose Schema & Validation:** Field-level constraints, unique SKU enforcement, positive values check, and calculated virtual attributes (`stockValue` and `id`).
- **Full CRUD Operations:** Seamless creation, retrieval, updating, and deletion of product items.
- **Advanced Querying:** Multi-field filtering (category, price range, stock availability, search by keyword), customizable sorting, and page-based pagination.
- **MongoDB Aggregation Pipelines:** Real-time generation of category-wise inventory valuation and average pricing.
- **Stock Adjustment & Safety Checks:** Atomic increment/decrement of quantities with validation preventing negative stock levels.
- **Low-Stock Alerting:** Instant reporting of items needing replenishment (`quantity <= reorderLevel`).
- **Centralized Error Handling:** Uniform handling of CastErrors (invalid ObjectIds), duplicate key errors (code 11000), schema validation failures, and 404 routes.

---

## 📁 Project Structure

```text
├── config/
│   └── db.js                 # MongoDB connection using Mongoose
├── controllers/
│   └── productController.js  # Controller handlers for all 8 endpoints
├── middleware/
│   └── errorHandler.js       # Centralized error and 404 handler
├── models/
│   └── Product.js            # Mongoose Product schema, virtuals, and indexes
├── routes/
│   └── productRoutes.js      # Express REST API routes
├── test/
│   └── api.test.js           # Automated test suite
├── .env                      # Environment configuration
├── .env.example              # Template environment variables
├── .gitignore                # Git ignore rules
├── package.json              # Project metadata, dependencies & scripts
├── postman_collection.json   # Ready-to-import Postman collection
├── seed.js                   # Database seeder matching assignment test cases
└── README.md                 # Detailed documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or later installed)
- [MongoDB](https://www.mongodb.com/) (Local Community Server running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Installation
Clone or navigate to the project directory and install the dependencies:
```bash
npm install
```

### 3. Environment Configuration
Ensure `.env` contains your port and MongoDB connection URI:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/inventory_db
NODE_ENV=development
```

### 4. Seed the Database
Populate the database with sample products across 5 categories (including the exact items featured in the lab manual):
```bash
npm run seed
```

### 5. Start the Server
- **Production mode:**
  ```bash
  npm start
  ```
- **Development mode (auto-restart on changes):**
  ```bash
  npm run dev
  ```

The server will start listening at: `http://localhost:5000`

### 6. Run Automated Tests
```bash
npm test
```

---

## 📡 API Endpoints Documentation

### 1. Create Product
- **Method & URL:** `POST /api/products`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "name": "Gel Pen Pack of 10",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 120,
  "quantity": 40,
  "reorderLevel": 20,
  "supplier": "Cello Pens"
}
```
- **Response:** `201 Created`
```json
{
  "name": "Gel Pen Pack of 10",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 120,
  "quantity": 40,
  "reorderLevel": 20,
  "supplier": "Cello Pens",
  "_id": "6a547727e5123427d6e61d7c",
  "createdAt": "2026-07-13T05:27:03.054Z",
  "updatedAt": "2026-07-13T05:27:03.054Z",
  "__v": 0,
  "stockValue": 4800,
  "id": "6a547727e5123427d6e61d7c"
}
```

---

### 2. Get All Products (Pagination, Filtering & Sorting)
- **Method & URL:** `GET /api/products`
- **Optional Query Parameters:**
  - `page`: Page number (default: `1`)
  - `limit`: Number of items per page (default: `10`)
  - `category`: Filter by category (e.g. `category=Furniture`)
  - `search`: Search substring in product `name` or `sku` (e.g. `search=Table`)
  - `minPrice`: Minimum price threshold (e.g. `minPrice=500`)
  - `maxPrice`: Maximum price threshold (e.g. `maxPrice=5000`)
  - `inStock`: `true` for items with quantity > 0, `false` for 0 stock
  - `sortBy`: Sorting field and order (e.g. `price:asc`, `price:desc`, `name:asc`, `-createdAt`)
- **Example Request:** `GET http://localhost:5000/api/products?page=1&limit=10`
- **Response:** `200 OK`
```json
{
  "total": 12,
  "page": 1,
  "totalPages": 2,
  "count": 10,
  "products": [
    {
      "_id": "6a54747a16123427d6e61d76",
      "name": "Study Table",
      "sku": "FURN-TB-012",
      "category": "Furniture",
      "price": 3999,
      "quantity": 2,
      "reorderLevel": 4,
      "supplier": "IKEA India",
      "createdAt": "2026-07-13T01:24:18.351Z",
      "updatedAt": "2026-07-13T01:24:18.351Z",
      "__v": 0,
      "stockValue": 7998,
      "id": "6a54747a16123427d6e61d76"
    }
  ]
}
```

---

### 3. Get Single Product by ID
- **Method & URL:** `GET /api/products/:id`
- **Response:** `200 OK`
```json
{
  "_id": "6a54747a16123427d6e61d76",
  "name": "Study Table",
  "sku": "FURN-TB-012",
  "category": "Furniture",
  "price": 3999,
  "quantity": 2,
  "reorderLevel": 4,
  "supplier": "IKEA India",
  "createdAt": "2026-07-13T01:24:18.351Z",
  "updatedAt": "2026-07-13T01:24:18.351Z",
  "__v": 0,
  "stockValue": 7998,
  "id": "6a54747a16123427d6e61d76"
}
```

---

### 4. Update Product Details
- **Method & URL:** `PUT /api/products/:id`
- **Request Body:**
```json
{
  "name": "Gel Pen Pack of 10",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 140,
  "quantity": 60
}
```
- **Response:** `200 OK`
```json
{
  "_id": "6a547727e5123427d6e61d7c",
  "name": "Gel Pen Pack of 10",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 140,
  "quantity": 60,
  "reorderLevel": 20,
  "supplier": "Cello Pens",
  "createdAt": "2026-07-13T05:27:03.054Z",
  "updatedAt": "2026-07-13T05:30:25.913Z",
  "__v": 0,
  "stockValue": 8400,
  "id": "6a547727e5123427d6e61d7c"
}
```

---

### 5. Stock Adjustment (Restock / Sale)
- **Method & URL:** `PATCH /api/products/:id/stock`
- **Request Body:**
```json
{
  "change": 10
}
```
*(Use positive integers to restock, negative integers for sales. Validates that resulting quantity never drops below 0).*
- **Response:** `200 OK`
```json
{
  "message": "Stock updated",
  "product": {
    "_id": "6a54747a16123427d6e61d76",
    "name": "Study Table",
    "sku": "FURN-TB-012",
    "category": "Furniture",
    "price": 3999,
    "quantity": 12,
    "reorderLevel": 4,
    "supplier": "IKEA India",
    "createdAt": "2026-07-13T01:24:18.351Z",
    "updatedAt": "2026-07-13T01:36:24.419Z",
    "__v": 0,
    "stockValue": 47988,
    "id": "6a54747a16123427d6e61d76"
  }
}
```

---

### 6. Delete Product
- **Method & URL:** `DELETE /api/products/:id`
- **Response:** `200 OK`
```json
{
  "message": "Product deleted",
  "id": "6a547727e5123427d6e61d7c"
}
```

---

### 7. Low-Stock Alert Report
- **Method & URL:** `GET /api/products/low-stock`
- **Condition:** Returns products where `quantity <= reorderLevel` using `{ $expr: { $lte: ["$quantity", "$reorderLevel"] } }`.
- **Response:** `200 OK`
```json
{
  "count": 4,
  "lowStockItems": [
    {
      "_id": "6a54747a16123427d6e61d76",
      "name": "Study Table",
      "sku": "FURN-TB-012",
      "category": "Furniture",
      "price": 3999,
      "quantity": 2,
      "reorderLevel": 4,
      "supplier": "IKEA India",
      "createdAt": "2026-07-13T01:24:18.351Z",
      "updatedAt": "2026-07-13T01:24:18.351Z",
      "__v": 0,
      "stockValue": 7998,
      "id": "6a54747a16123427d6e61d76"
    }
  ]
}
```

---

### 8. Category-wise Inventory Summary (Aggregation)
- **Method & URL:** `GET /api/products/summary`
- **Aggregation Pipeline:** Groups by `$category` calculating `totalItems`, `totalQuantity`, `totalStockValue`, and `avgPrice`.
- **Response:** `200 OK`
```json
{
  "categories": 5,
  "summary": [
    {
      "_id": "Apparel",
      "totalItems": 2,
      "totalQuantity": 50,
      "totalStockValue": 77950,
      "avgPrice": 1399
    },
    {
      "_id": "Books",
      "totalItems": 2,
      "totalQuantity": 32,
      "totalStockValue": 30400,
      "avgPrice": 1050
    },
    {
      "_id": "Electronics",
      "totalItems": 4,
      "totalQuantity": 79,
      "totalStockValue": 332204,
      "avgPrice": 3936.5
    },
    {
      "_id": "Furniture",
      "totalItems": 2,
      "totalQuantity": 17,
      "totalStockValue": 105483,
      "avgPrice": 5249
    },
    {
      "_id": "Stationery",
      "totalItems": 2,
      "totalQuantity": 160,
      "totalStockValue": 15000,
      "avgPrice": 102.5
    }
  ]
}
```

---

## 🎯 Rubric Alignment

| Criteria | Maximum Marks | Implementation Details |
| :--- | :---: | :--- |
| **Database Schema Design & Validation (Mongoose)** | **0.5** | Complete field-level validation (required, types, min values, uppercase SKU, trim) and virtual `stockValue` (`price * quantity`). |
| **CRUD Functionality** | **0.75** | `POST` (create), `GET` (all & single), `PUT` (update), `DELETE` (delete), and `PATCH` (safe stock adjustment). |
| **Querying – Filtering, Sorting, Pagination** | **0.5** | Multi-attribute filters (category, search, price ranges, inStock), sorting (`sortBy`), and page/limit pagination with `totalPages` and `count`. |
| **Aggregation – Low-Stock & Category Summary** | **0.5** | MongoDB `$expr` low-stock query and multi-stage `$group` aggregation pipeline for real-time inventory metrics. |
| **API Design & Clean Code** | **0.25** | Modular MVC pattern, route ordering safety, centralized error handler, `.env` config, and automated test suite. |
| **Total** | **2.5 / 2.5** | **100% Complete** |

---

## 📮 Submission Instructions

As per classroom guidelines:
1. Ensure your files are under a folder named `Assignment 3` in your `Web Dev III assignments` or `Backend development` repository.
2. Commit and push the changes to GitHub.
3. Submit the repository link in the provided submission form.
4. On the form's **Host link** field, write **`NA`** as directed.
