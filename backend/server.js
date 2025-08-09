const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const app = express();
const PORT = 5000;
const JWT_SECRET = '123!@#';

const razorpay = new Razorpay({
  key_id: "rzp_test_EH1UEwLILEPXCj",
  key_secret: "ppM7JhyVpBtycmMcFGxYdacw"
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use('/images', express.static('images'));

// MySQL connection
async function connectDB() {
  return await mysql.createConnection({
    host: 'database-3.cr2ue6u44sny.eu-north-1.rds.amazonaws.com',
    user: 'admin',
    password: 'ramchin123',
    database: 'hospital_ecom',
  });
}

// SIGNUP Route
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const connection = await connectDB();
  try {
    const [existing] = await connection.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await connection.execute(
      'INSERT INTO users (username, email, password, raw_password) VALUES (?, ?, ?, ?)',
      [username, email, hashed, password]
    );
    

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Signup error', details: err.message });
  } finally {
    connection.end();
  }
});

// LOGIN Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const connection = await connectDB();
  try {
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(password, users[0].password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: users[0].user_id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token,userId:users[0].user_id });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  } finally {
    connection.end();
  }
});

// Fetch categories
app.get('/api/categories', async (req, res) => {
  try {
    const connection = await connectDB();
    const [rows] = await connection.execute('SELECT DISTINCT category FROM products');
    connection.end();
    const categories = rows.map(row => row.category);
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/products/:category', async (req, res) => {
  const category = decodeURIComponent(req.params.category);
  const connection = await connectDB();
  try {
    const [products] = await connection.execute(
      'SELECT * FROM products WHERE category = ? AND stock_quantity > 0',
      [category]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for this category.' });
    }

    // Add image_data field
    const productsWithImages = products.map(product => {
      let imageData = "";
      if (product.image_url) {
        try {
          const imagePath = path.join(__dirname, 'images', product.image_url);
          if (fs.existsSync(imagePath)) {
            imageData = fs.readFileSync(imagePath, { encoding: 'base64' });
          }
        } catch (err) {
          console.error(`Error reading image for product ${product.id}:`, err.message);
        }
      }
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        image_data: imageData
      };
    });

    res.json(productsWithImages);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  } finally {
    connection.end();
  }
});


// Get single product by ID
app.get('/api/product/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await connectDB();
  try {
    const [result] = await connection.execute('SELECT * FROM products WHERE id = ?', [id]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result[0]);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  } finally {
    await connection.end();
  }
});

// Update product stock
app.post('/api/update-stock', async (req, res) => {
  const { productId, quantityPurchased } = req.body;

  if (!productId || !Number.isInteger(quantityPurchased) || quantityPurchased <= 0) {
    return res.status(400).json({ error: 'Invalid product ID or quantity' });
  }

  const connection = await connectDB();
  try {
    await connection.beginTransaction();

    const [results] = await connection.execute(

      'SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE',
      [productId]
    );

    if (results.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Product not found' });
    }

    const currentStock = results[0].stock_quantity;

    if (currentStock < quantityPurchased) {
      await connection.rollback();
      return res.status(400).json({ error: 'Not enough stock' });
    }

    await connection.execute(
      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
      [quantityPurchased, productId]
    );

    await connection.commit();
    res.json({ message: 'Stock updated successfully' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: 'Update failed', details: err.message });
  } finally {
    await connection.end();
  }
});

app.post("/api/create-order", async (req, res) => {
  const { amount, currency = "INR", receipt } = req.body;

  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
    };
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ success: false, message: "Failed to create order", error });
  }
});

// Generate UPI Link
app.post('/api/generate-upi-link', (req, res) => {
  const { amount, orderId } = req.body;

  if (!amount || !orderId) {
    return res.status(400).json({ error: 'Amount and Order ID required' });
  }

  const upiId = '7598162840@axl'; // Replace with your UPI ID
  const upiLink = `upi://pay?pa=${upiId}&pn=MediStoreX&am=${amount}&tn=${orderId}&cu=INR`;

  res.json({ upiLink, qrData: upiLink });
});

// Add to Wishlist
app.post('/api/wishlist', (req, res) => {
  const { user_id, product_id } = req.body;
  const q = 'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)';
  db.query(q, [user_id, product_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Added to wishlist' });
  });
});

// Get Wishlist for User
app.get('/api/wishlist/:user_id', (req, res) => {
  const userId = req.params.user_id;
  const q = `
    SELECT w.id, p.*
    FROM wishlist w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ?
  `;
  db.query(q, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// Remove from Wishlist
app.delete('/api/wishlist/:id', (req, res) => {
  const id = req.params.id;
  const q = 'DELETE FROM wishlist WHERE id = ?';
  db.query(q, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Removed from wishlist' });
  });
});

app.post('/api/place-order', async (req, res) => {
  const connection = await connectDB();
  try {
    await connection.beginTransaction();

    // 1. Extract data from request
    const { 
      items, 
      totalPrice, 
      userDetails, 
      userId = 1, 
      paymentMethod = 'cash',
      transactionId = null // This comes from frontend
    } = req.body;

    // 2. Generate order IDs
    const orderId = `ORD-${Date.now()}`;
    const trackingId = `TRK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

    let paymentStatus = 'processing';
    if (paymentMethod === 'upi' || paymentMethod === 'razorpay') {
      paymentStatus = 'paid';
    }

    // 3. Insert into orders table (UPDATED to include transaction_id)
    await connection.execute(
      `INSERT INTO orders (
        user_id, order_id, tracking_id, transaction_id,
        total_amount, payment_method, status,
        customer_name, customer_address, customer_city, customer_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        orderId,
        trackingId,
        // Only store transaction_id for UPI payments
        paymentMethod === 'upi' ? transactionId : null,
        totalPrice,
        paymentMethod,
        paymentMethod === 'upi' ? 'paid' : 'processing',
        userDetails.name,
        userDetails.address,
        userDetails.city,
        userDetails.phone
      ]
    );

    // 4. Insert order items (unchanged)
    for (const item of items) {
      const product = item.product || item;
      await connection.execute(
        `INSERT INTO order_items (
          order_id, product_id, product_name, quantity, unit_price, total_price
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          product.id,
          product.name,
          item.quantity || 1,
          product.price,
          (product.price * (item.quantity || 1)).toFixed(2)
        ]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      orderId,
      trackingId,
      transactionId: paymentMethod === 'upi' ? transactionId : null, // Return conditionally
      message: "Order saved successfully"
    });

  } catch (err) {
    await connection.rollback();
    console.error("Order save error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await connection.end();
  }
});

app.post('/api/get-user-by-name', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const connection = await connectDB();
  try {
    const [rows] = await connection.execute('SELECT user_id FROM users WHERE username = ?', [name]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ userId: rows[0].user_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user', details: err.message });
  } finally {
    connection.end();
  }
});

app.get('/api/order-history/:userId', async (req, res) => {
  const userId = req.params.userId;

  const connection = await connectDB();
  try {
    const [orders] = await connection.execute(
      `SELECT 
        order_id, tracking_id, total_amount, payment_method, status,
        customer_name, customer_address, customer_city, customer_phone,
        created_at
       FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ success: true, orders });
  } catch (err) {
    console.error("Error fetching order history:", err.message);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    connection.end();
  }
});

app.get('/api/user-profile/:userId', async (req, res) => {
  const userId = req.params.userId;
  const connection = await connectDB();

  try {
    const [rows] = await connection.execute(
      `SELECT username, email FROM users WHERE user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  } finally {
    connection.end();
  }
});

app.put('/api/update-user/:userId', async (req, res) => {
  const userId = req.params.userId;
  const {
    customer_name,
    customer_address,
    customer_city,
    customer_phone,
    email
  } = req.body;

  const connection = await connectDB();
  try {
    await connection.execute(
      'UPDATE users SET email = ? WHERE user_id = ?',
      [email, userId]
    );

    await connection.execute(
      `UPDATE orders SET 
        customer_name = ?, 
        customer_address = ?, 
        customer_city = ?, 
        customer_phone = ?
      WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [customer_name, customer_address, customer_city, customer_phone, userId]
    );

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    connection.end();
  }
});

// Get user addresses
app.get('/api/user-addresses/:userId', async (req, res) => {
  const userId = req.params.userId;
  const connection = await connectDB();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC',
      [userId]
    );
    res.json({ addresses: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch addresses', details: err.message });
  } finally {
    connection.end();
  }
});

// Add new address
app.post('/api/add-address', async (req, res) => {
  const { userId, name, address, city, phone, email, isDefault } = req.body;
  const connection = await connectDB();
  try {
    await connection.beginTransaction();

    // If setting as default, first remove default from any existing addresses
    if (isDefault) {
      await connection.execute(
        'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?',
        [userId]
        
      );
    }

    // Insert new address
    const [result] = await connection.execute(
      `INSERT INTO user_addresses 
      (user_id, name, email, address, city, phone, is_default) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, email, address, city, phone, isDefault]
    );

    await connection.commit();
    res.json({ 
      address: {
        id: result.insertId,
        user_id: userId,
        name,
        email,
        address,
        city,
        phone,
        is_default: isDefault
      }
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: 'Failed to add address', details: err.message });
  } finally {
    connection.end();
  }
});

app.get('/api/image-base64/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, 'images', filename);
  try {
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }
    const ext = path.extname(filename).slice(1);
    const base64 = fs.readFileSync(imagePath, { encoding: 'base64' });
    res.json({ image: `data:image/${ext};base64,${base64}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to convert image', details: err.message });
  }
});



// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://0.0.0.0:${PORT}`);
});
