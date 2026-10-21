const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const pool = require('./db');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required.',
      });
    }

    // Validate name
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        message: 'Name must be a valid string.',
      });
    }

    // Validate email
    if (
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        message: 'Please provide a valid email address.',
      });
    }

    // Validate password type and length
    if (typeof password !== 'string') {
      return res.status(400).json({
        message: 'Password must be a string.',
      });
    }

    if (password.length < 10) {
      return res.status(400).json({
        message: 'Password must be at least 10 characters long.',
      });
    }

    // Hash password before saving
    const passwordHash = await bcrypt.hash(password, 10);

    // Save user in PostgreSQL
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name.trim(), email.trim().toLowerCase(), passwordHash]
    );

    return res.status(201).json({
      message: 'User registered successfully.',
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        message: 'This email is already registered.',
      });
    }

    console.error('Registration error:', error.message);

    return res.status(500).json({
      message: 'Something went wrong during registration.',
    });
  }
});

// Login an existing user
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        message: info?.message || 'Invalid email or password.',
      });
    }

    req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      return res.json({
        message: 'Login successful.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    });
  })(req, res, next);
});

// Check whether the user is logged in
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      message: 'Not logged in.',
    });
  }

  return res.json({
    message: 'Session is working!',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

// Logout the current user
router.post('/logout', (req, res, next) => {
  req.logout((logoutError) => {
    if (logoutError) {
      return next(logoutError);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie('connect.sid', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      });

      return res.json({
        message: 'Logout successful.',
      });
    });
  });
});

module.exports = router;