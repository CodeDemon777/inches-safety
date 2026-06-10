# 🌱 EcoCycle Store – Inches

Welcome to **EcoCycle Store (Inches)**, a premium full-stack e-commerce platform dedicated to offering eco-friendly sanitary pads crafted from ultra-soft bamboo fiber. Our products are designed to be 100% biodegradable, chemical-free, and rash-free, providing a healthy and sustainable solution.

This repository contains both the **Frontend** (React + TypeScript + Vite + TailwindCSS) and the **Backend** (Node.js + Express + MongoDB).

---

## ✨ Features

### 🛒 Customer Experience
* **Dynamic Shop Page**: Browse products with rich descriptions, pricing, and high-quality image previews.
* **Shopping Cart**: Add, remove, and update item quantities dynamically.
* **User Authentication**: Secure signup and login using JSON Web Tokens (JWT) and encrypted passwords.
* **Interactive Reviews**: Submit ratings and feedback on products.
* **User Profiles**: Manage profile details and track order histories.
* **Contact & Support**: Real-time nodemailer integration for customer inquiry notifications.

### 👑 Admin Features
* **Admin Dashboard**: Manage inventory (add, edit, and delete products).
* **Order Tracking**: View customer orders, change payment statuses, and update shipping details.
* **Automated Invoices**: Dynamically generate PDF invoices using PDFKit, complete with automatic email attachments sent to users upon order placement/shipped/delivered stages.

---

## 🛠️ Tech Stack

* **Frontend**: React (TypeScript), Vite, Tailwind CSS, Lucide Icons, Shadcn UI, Zustand (State Management), TanStack Query, Framer Motion (Animations)
* **Backend**: Node.js, Express.js, MongoDB (Mongoose ORM), JWT (Authentication), Helmet & Express-Rate-Limit (Security), Nodemailer (Email Transports), PDFKit (Invoice Generation)

---

## 🚀 Step-by-Step Local Setup Guide

Follow these steps to clone and run the application on your local PC or laptop.

### 📋 Prerequisites
Before you begin, ensure you have the following installed on your machine:
* **Node.js** (v18.x or newer is recommended)
* **npm** (comes with Node.js) or **bun** package manager
* **MongoDB** (running locally or a MongoDB Atlas connection string)

---

### Step 1: Clone the Repository
Open your terminal (PowerShell, Command Prompt, or bash) and run:
```bash
git clone <your-repository-url>
cd ecocycle-store-main
```

---

### Step 2: Configure & Start the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file in the `backend` folder (or edit the existing one) and fill in your details:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/ecocycle
   JWT_SECRET=your_jwt_secret_key_here
   ```
   > 💡 *Note: If you are using a cloud-hosted MongoDB database, replace `mongodb://127.0.0.1:27017/ecocycle` with your MongoDB Atlas connection string.*

3. Install backend dependencies:
   ```bash
   npm install
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will start running on **`http://localhost:5000`**. You should see the message: `Server running on port 5000` and `Connected to MongoDB` in the console.

---

### Step 3: Configure & Start the Frontend

1. Open a new terminal window or tab, and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Create a `.env` file in the `frontend` folder (or edit the existing one) to specify the local API URL:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. Install frontend dependencies:
   ```bash
   npm install
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will start running on **`http://localhost:8080`**. Open your browser and navigate to `http://localhost:8080` to explore the store!

---

### Step 4: Elevate an Account to Admin (Optional)

To access the Admin panel and manage products or view customer orders:

1. Open the web app in your browser at `http://localhost:8080/login`.
2. Register a new user account with the email: **`inches.safety@gmail.com`**.
3. In your terminal, navigate to the `backend` directory.
4. Run the helper script to update the role of this user to admin:
   ```bash
   node update-admin.js
   ```
5. Log out and log back into the web app using `inches.safety@gmail.com`. You will now have full access to the **Admin Dashboard**!

---

## 🔍 Verification & Health Checks
* **API Health Endpoint**: Open `http://localhost:5000/api/health` in your browser. It should respond with `{"status":"ok"}`.
* **Backend Root Endpoint**: Open `http://localhost:5000/` in your browser. It should display: `Backend Running Successfully 🚀`.
