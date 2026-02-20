# 🛒 MERN E-Commerce Backend API

A full-featured E-commerce REST API built using *Node.js, Express, MongoDB & Mongoose* as part of my MERN Stack learning journey.

This backend includes authentication, role-based access control, cart management, order processing with MongoDB transactions, product reviews, contact system, and admin analytics.

---

## 🚀 Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Zod Validation
- Cloudinary (Image Upload)
- Multer
- MongoDB Transactions
- MongoDB Aggregation Framework

---

## 🔐 Features

### 👤 Authentication
- User Registration & Login
- JWT-based Authentication
- Protected Routes
- Role-based Access (User / Admin)

### 🛍 Products
- Create / Update / Delete Products
- Stock Management
- Discount Handling
- Best Seller Flag
- Text Search
- Filters & Pagination

### 🛒 Cart
- Add to Cart
- Update Quantity
- Remove Item
- Clear Cart
- Automatic Total Calculation

### 📦 Orders
- Create Order from Cart
- MongoDB Transaction Implementation
- Stock Validation
- Order Status Management
- Cancel Order
- Admin Order Management

### ⭐ Reviews
- Add Review (Only Verified Buyer)
- Update Review
- Delete Review
- Automatic Rating Recalculation
- Admin Review Moderation

### 📊 Admin Dashboard
- Total Users
- Total Orders
- Revenue Calculation
- Monthly Sales Aggregation
- Top Selling Products

### 📬 Contact System
- Submit Contact Form
- Admin Manage Contact Queries

---

## 📁 Project Structure
ecommerce-backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validations/
│   ├── utils/
│   └── app.js
│   └── server.js
│
├── package-lock.json
├── package.json
├── .gitignore
├── .env
├── README.md

---

## ⚙️ Environment Variables

Create a `.env` file: