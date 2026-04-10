const router = require('express').Router();
const auth = require('../controllers/authController');
const check = require('../middleware/authMiddleware');
const db = require('../config/db');

// ==========================
// 🔐 LOGIN
// ==========================
router.get('/', auth.loginPage);
router.post('/login', auth.login);

// ==========================
// 🏠 ADMIN DASHBOARD
// ==========================
router.get('/dashboard', check, auth.dashboard);

// ==========================
// 🚪 LOGOUT
// ==========================
router.get('/logout', auth.logout);

// ==========================
// ✅ REGISTER (NO IMAGE)
// ==========================

// Show register page
router.get('/register', (req, res) => {
  res.render('register');
});

// Handle register
router.post('/register', (req, res) => {

  const full_name = req.body.full_name;
  const reg_no = req.body.reg_no;
  const dept = req.body.dept;
  const year = req.body.year;
  const username = req.body.username;
  const password = req.body.password;

  db.query(
    `INSERT INTO users 
    (full_name, reg_no, dept, year, username, password, role) 
    VALUES (?, ?, ?, ?, ?, ?, 'user')`,
    [full_name, reg_no, dept, year, username, password],
    (err) => {

      if (err) {
        console.log(err);
        return res.send("❌ Registration failed");
      }

      res.redirect('/');
    }
  );

});

// ==========================
// 🔑 FORGOT PASSWORD
// ==========================

// Show forgot page
router.get('/forgot', (req, res) => {
  res.render('forgot');
});

// Handle password reset
router.post('/forgot', (req, res) => {

  const { username, new_password } = req.body;

  db.query(
    "UPDATE users SET password=? WHERE username=?",
    [new_password, username],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.send("❌ Error updating password");
      }

      if (result.affectedRows === 0) {
        return res.send("❌ User not found");
      }

      res.redirect('/');
    }
  );

});

module.exports = router;