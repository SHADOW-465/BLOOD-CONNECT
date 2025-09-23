# BloodConnect Pro - Full-Stack Development Guide

This document provides a comprehensive guide for setting up and building the full-stack BloodConnect Pro application. It is intended for developers who will be working on the project, and it covers everything from initial project setup to backend and frontend development, including the implementation of a neumorphic UI design.

## 1. Prerequisites

Before you begin, ensure you have the following tools and technologies installed on your local development machine:

*   **Node.js and npm:** Required for running the frontend and backend. You can download it from [nodejs.org](https://nodejs.org/).
*   **Git:** For version control. You can download it from [git-scm.com](https://git-scm.com/).
*   **A SQL Database:** Such as MySQL, PostgreSQL, or SQLite. The SQL scripts in `features.md` are written in a generic SQL dialect but are most compatible with MySQL.
*   **A Code Editor:** Such as Visual Studio Code, Sublime Text, or Atom.

## 2. Project Setup

Follow these steps to get the project set up and running on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd blood-connect-pro
    ```

2.  **Install frontend dependencies:**
    The frontend is a React application. Navigate to the frontend directory and install the necessary npm packages.
    ```bash
    cd frontend # or the root directory if that's where package.json is
    npm install
    ```

3.  **Set up the backend:**
    The backend will be a Node.js application. You will need to create a new directory for it.
    ```bash
    mkdir backend
    cd backend
    npm init -y
    npm install express mysql2 # or pg for PostgreSQL
    ```

4.  **Set up the database:**
    *   Connect to your SQL database.
    *   Create a new database for the application (e.g., `blood_connect_pro`).
    *   Run the SQL scripts from `features.md` to create the necessary tables.

5.  **Configure environment variables:**
    Create a `.env` file in the `backend` directory to store your database credentials and other sensitive information.
    ```
    DB_HOST=localhost
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=blood_connect_pro
    ```

## 3. Backend Development

The backend will be a Node.js application using the Express framework to create a RESTful API. It will connect to the SQL database to perform CRUD (Create, Read, Update, Delete) operations.

### 3.1. Setting up the Express Server

In the `backend` directory, create a file named `server.js` and add the following code to set up a basic Express server:

```javascript
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('BloodConnect Pro API is running!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
```

### 3.2. Connecting to the Database

Create a file named `db.js` to manage the database connection.

```javascript
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
```

### 3.3. Creating API Endpoints

You will need to create API endpoints for each of the features defined in `features.md`. Here is an example for the "User Authentication" feature.

Create a new directory named `routes` and a file named `auth.js` inside it.

```javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password, phone, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, phone_number, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, role]
        );
        res.status(201).json({ id: result.insertId, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

In `server.js`, you would then use this router:

```javascript
// ... server setup ...

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// ... app.listen ...
```

You should create similar route files for all other features (e.g., `blood_requests.js`, `donors.js`, etc.), following the same structure.

## 4. Frontend Development

The frontend is a React application. The goal is to create a mobile-first design that scales to the desktop, with a neumorphic soft UI.

### 4.1. Neumorphic UI Design

Neumorphism is a design style that uses soft shadows and highlights to create a "soft" or "extruded" look. Here are some tips for achieving this effect with CSS:

*   **Background Color:** Use a light, off-white, or light-gray background color for the main interface.
*   **Box Shadow:** Use two shadows for each element: a light-colored shadow on the top-left and a dark-colored shadow on the bottom-right.
*   **Elements:** Apply this style to buttons, cards, input fields, and other UI elements.

Here is an example of a neumorphic button in CSS:

```css
.neumorphic-button {
    background-color: #e0e0e0;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 6px 6px 12px #bebebe,
                -6px -6px 12px #ffffff;
    transition: all 0.2s ease-in-out;
}

.neumorphic-button:hover {
    box-shadow: inset 6px 6px 12px #bebebe,
                inset -6px -6px 12px #ffffff;
}
```

You should create a set of reusable React components (e.g., `Button`, `Card`, `Input`) with this neumorphic style.

### 4.2. Connecting to the Backend API

To connect the frontend to the backend, you can use a library like `axios` to make HTTP requests to your API endpoints.

First, install `axios`:
```bash
npm install axios
```

Then, you can create a service to handle API calls. Create a new file `src/services/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api', // Your backend API URL
});

export default api;
```

Now, you can use this `api` service in your React components to fetch data. For example, in `src/pages/Login.jsx`:

```javascript
import React, { useState } from 'react';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            // Redirect to dashboard
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    // ... rest of the component
};
```

## 5. Integration, Testing, and Deployment

### 5.1. Running the Full-Stack Application

To run the full-stack application, you will need to start both the backend and frontend servers.

*   **Start the backend server:**
    ```bash
    cd backend
    npm start
    ```

*   **Start the frontend server:**
    ```bash
    cd frontend # or root directory
    npm start
    ```

The React application should now be running on `http://localhost:3000` and the backend API on `http://localhost:3001`.

### 5.2. Testing

A comprehensive testing strategy is crucial for a production-ready application. Here are some suggestions:

*   **Unit Testing:** Test individual components and functions in isolation. For the frontend, you can use `Jest` and `React Testing Library`. For the backend, you can use a framework like `Mocha` or `Jest`.
*   **Integration Testing:** Test the interaction between different parts of the application, such as the frontend and backend.
*   **End-to-End (E2E) Testing:** Test the entire application flow from the user's perspective. Tools like `Cypress` or `Playwright` are excellent for this.

### 5.3. Deployment

When you are ready to deploy the application, here is a general guide:

*   **Backend:** Deploy the Node.js application to a cloud platform like Heroku, AWS, or Google Cloud.
*   **Frontend:** Build the React application for production (`npm run build`) and deploy the static files to a service like Netlify, Vercel, or an AWS S3 bucket.
*   **Database:** Use a managed database service like Amazon RDS, Google Cloud SQL, or Heroku Postgres.

Remember to update your environment variables in the deployed environment to use the production database credentials and the URL of your deployed backend.
