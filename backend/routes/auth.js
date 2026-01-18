const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// 使用者註冊
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, country } = req.body;

    // 驗證輸入
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // 檢查郵箱是否已存在
    const db = req.app.get('db');
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Database error',
          details: err.message
        });
      }

      if (results.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }

      // 密碼雜湊
      const hashedPassword = await bcryptjs.hash(password, 10);

      // 建立新使用者
      db.query(
        'INSERT INTO users (email, password, first_name, last_name, phone, country) VALUES (?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, first_name, last_name, phone, country],
        (err, results) => {
          if (err) {
            return res.status(500).json({
              success: false,
              error: 'Error creating user',
              details: err.message
            });
          }

          return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: results.insertId
          });
        }
      );
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message
    });
  }
});

// 使用者登入
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 驗證輸入
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const db = req.app.get('db');
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Database error'
        });
      }

      // 檢查使用者是否存在
      if (!results || results.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Email or password incorrect'
        });
      }

      // 驗證密碼
      const isPasswordValid = await bcryptjs.compare(password, results[0].password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Email or password incorrect'
        });
      }

      // 產生 JWT token
      const token = jwt.sign(
        { id: results[0].id, email: results[0].email, role: results[0].role },
        process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: results[0].id,
          email: results[0].email,
          first_name: results[0].first_name,
          last_name: results[0].last_name
        }
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// 獲取當前使用者
router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    const db = req.app.get('db');

    db.query('SELECT id, email, first_name, last_name, phone, country FROM users WHERE id = ?', [decoded.id], (err, results) => {
      if (err || !results.length) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        user: results[0]
      });
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

module.exports = router;
