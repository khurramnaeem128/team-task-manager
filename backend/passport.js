
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const pool = require('./db');

// Verify email and password during login
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const result = await pool.query(
          'SELECT id, name, email, password_hash FROM users WHERE email = $1',
          [email.trim().toLowerCase()]
        );

        const user = result.rows[0];

        if (!user) {
          return done(null, false, {
            message: 'Invalid email or password.',
          });
        }

        const passwordMatches = await bcrypt.compare(
          password,
          user.password_hash
        );

        if (!passwordMatches) {
          return done(null, false, {
            message: 'Invalid email or password.',
          });
        }

        return done(null, {
          id: user.id,
          name: user.name,
          email: user.email,
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Store the user's ID in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Retrieve the user on later requests
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return done(null, false);
    }

    return done(null, result.rows[0]);
  } catch (error) {
    return done(error);
  }
});

module.exports = passport;
