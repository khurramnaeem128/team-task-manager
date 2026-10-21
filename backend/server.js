
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db');

require('./passport');

const authRoutes = require('./auth');
const teamRoutes = require('./teams');
const taskRoutes = require('./tasks');



const app = express();
const PORT = process.env.PORT || 5000;

// 1. CORS configuration
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// 2. Parse JSON request bodies
app.use(express.json());

// 3. Session configuration — must come before Passport
app.use(
  session({
    store: new pgSession({
      pool,
      tableName: 'user_sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Local development only
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// 4. Passport middleware
app.use(passport.initialize());
app.use(passport.session());



// 5. Authentication routes — after session and Passport
app.use('/auth', authRoutes);
app.use('/teams', teamRoutes);
app.use('/tasks', taskRoutes);


// 6. Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Team Task Manager API is running!',
  });
});

// 7. Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

