const router = require('express').Router();
const user = require('../controllers/userController');
const check = require('../middleware/authMiddleware');
const db = require('../config/db');

// ==========================
// 🏠 USER DASHBOARD
// ==========================
router.get('/dashboard', check, user.dashboard);

// ==========================
// 📚 AVAILABLE BOOKS
// ==========================
router.get('/books', check, user.books);

// ==========================
// 📖 SINGLE BOOK DETAILS
// ==========================
router.get('/book/:id', check, user.bookDetails);
// ✏️ EDIT PROFILE PAGE
router.get('/edit-profile', check, user.editProfilePage);

// 💾 UPDATE PROFILE
router.post('/edit-profile', check, user.updateProfile);

// ==========================
// 📜 HISTORY PAGE
// ==========================
router.get('/history', check, (req, res) => {

  const username = req.session.user;

  db.query(`
    SELECT b.book_name, i.issue_date, i.return_date, i.due_date
    FROM issued_books i
    JOIN books b ON i.book_id = b.id
    WHERE i.student_name = ? AND i.return_date IS NOT NULL
    ORDER BY i.return_date DESC
  `, [username], (err, history) => {

    if (err) {
      console.log(err);
      return res.send("❌ Error loading history");
    }

    res.render('userHistory', {
      history,
      current: 'history',
      role: req.session.role
    });

  });

});

// ==========================
// 👤 PROFILE PAGE
// ==========================
router.get('/profile', check, (req, res) => {

  const username = req.session.user;

  db.query(
    "SELECT * FROM users WHERE username=?",
    [username],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.send("❌ Error loading profile");
      }

      res.render('userProfile', {
        user: result[0],
        current: 'profile',
        role: req.session.role
      });

    }
  );

});

// ==========================
// 🔐 CHANGE PASSWORD
// ==========================
router.post('/change-password', check, (req, res) => {

  const { old_password, new_password } = req.body;
  const username = req.session.user;

  db.query(
    "SELECT * FROM users WHERE username=? AND password=?",
    [username, old_password],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.send("❌ Error verifying password");
      }

      if (result.length === 0) {
        return res.send("❌ Wrong old password");
      }

      db.query(
        "UPDATE users SET password=? WHERE username=?",
        [new_password, username],
        (err) => {

          if (err) {
            console.log(err);
            return res.send("❌ Error updating password");
          }

          res.redirect('/user/profile');
        }
      );

    }
  );

});

module.exports = router;