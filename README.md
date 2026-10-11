# Inventory Management System

A RESTful API built using Node.js, Express.js, MongoDB, and Mongoose to manage products and inventory efficiently.

## Features

- Create, view, update, and delete products (CRUD).
- Manage stock through restocking and sales.
- Filter, sort, and paginate products.
- Identify low-stock products.
- Generate category-wise inventory summaries.
- Validate inputs and handle errors.
- Use environment variables with dotenv.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv

## Installation and Setup

1. Clone the repository:

   ```bash
   git clone YOUR_GITHUB_REPOSITORY_URL
   ```

2. Navigate to the project folder:

   ```bash
   cd inventory-management
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root folder:

   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/inventoryDB
   ```

5. Start the server:

   ```bash
   node server.js
   ```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check server status |
| POST | `/api/products` | Create a product |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get a product by ID |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| PATCH | `/api/products/:id/restock` | Add stock |
| PATCH | `/api/products/:id/sale` | Reduce stock |
| GET | `/api/products/low-stock` | View low-stock products |
| GET | `/api/products/category-summary` | View category-wise summary |

## Database

Database name: `inventoryDB`  
Collection name: `products`

## Author

Created as part of the Web Development III Lab Assignment.
