const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// =====================
// 🔧 MIDDLEWARE
// =====================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// =====================
// 📁 STATIC FILES
// =====================
app.use(express.static(path.join(__dirname, 'public')));

// =====================
// 🔐 SESSION
// =====================
app.use(session({
  secret: 'library_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,   // 👉 change to true in production (HTTPS)
    httpOnly: true
  }
}));

// =====================
// 🌍 GLOBAL VARIABLES (🔥 FINAL FIX)
// =====================
app.use((req, res, next) => {

  // Role (admin/user)
  res.locals.role = req.session.role || 'user';

  // Active menu highlight
  res.locals.current = '';

  // Logged user details (for sidebar/profile)
  res.locals.user = {
    username: req.session.user || null,
    role: req.session.role || 'user'
  };

  next();
});

// =====================
// 🎨 VIEW ENGINE
// =====================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =====================
// 🚀 ROUTES
// =====================

// 🔐 Auth + Admin
app.use('/', require('./routes/authRoutes'));

// 📚 Books (Admin)
app.use('/', require('./routes/bookRoutes'));

// 🔄 Issue (Admin)
app.use('/issue', require('./routes/issueRoutes'));

// 👤 USER PANEL
app.use('/user', require('./routes/userRoutes'));

// 👥 ADMIN USER MANAGEMENT (NEW)
app.use('/admin', require('./routes/adminRoutes'));

// =====================
// ❌ 404 HANDLER
// =====================
app.use((req, res) => {
  res.status(404).send("❌ Page not found");
});

// =====================
// 🔥 SERVER
// =====================
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});