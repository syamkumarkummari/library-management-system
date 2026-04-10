const router = require('express').Router();
const db = require('../config/db');
const check = require('../middleware/authMiddleware');

// ==============================
// 👥 VIEW USERS (NO DUPLICATES)
// ==============================
router.get('/users', check, (req, res) => {

  db.query(`
    SELECT u.*
    FROM users u
    INNER JOIN (
      SELECT MIN(id) as id
      FROM users
      WHERE role='user'
      GROUP BY username
    ) grouped
    ON u.id = grouped.id
  `, (err, users) => {

    if (err) {
      console.log(err);
      return res.send("❌ Error fetching users");
    }

    res.render('adminUsers', {
      users,
      current: 'users',
      role: 'admin'
    });

  });

});

// ==============================
// ➕ ADD USER PAGE
// ==============================
router.get('/users/add', check, (req, res) => {

  res.render('addUser', {
    current: 'users',
    role: 'admin'
  });

});

// ==============================
// ➕ ADD USER
// ==============================
router.post('/users/add', check, (req, res) => {

  const { full_name, reg_no, dept, year, username, password } = req.body;

  db.query(
    `INSERT INTO users 
     (full_name, reg_no, dept, year, username, password, role)
     VALUES (?, ?, ?, ?, ?, ?, 'user')`,
    [full_name, reg_no, dept, year, username, password],
    (err) => {

      if (err) {
        console.log(err);
        return res.send("❌ Failed to add user");
      }

      res.redirect('/admin/users');

    }
  );

});

// ==============================
// ✏️ EDIT USER
// ==============================
router.get('/users/edit/:id', check, (req, res) => {

  db.query("SELECT * FROM users WHERE id=?", [req.params.id], (err, result) => {

    res.render('editUser', {
      user: result[0],
      current: 'users',
      role: 'admin'
    });

  });

});

// ==============================
// 💾 UPDATE USER
// ==============================
router.post('/users/edit/:id', check, (req, res) => {

  const { full_name, reg_no, dept, year } = req.body;

  db.query(
    "UPDATE users SET full_name=?, reg_no=?, dept=?, year=? WHERE id=?",
    [full_name, reg_no, dept, year, req.params.id],
    () => res.redirect('/admin/users')
  );

});

// ==============================
// ❌ DELETE USER
// ==============================
router.get('/users/delete/:id', check, (req, res) => {

  db.query("DELETE FROM users WHERE id=?", [req.params.id], () => {
    res.redirect('/admin/users');
  });

});

// ==============================
// 📊 USER ACTIVITY (FINAL)
// ==============================
router.get('/users/activity/:username', check, (req, res) => {

  const username = req.params.username;

  // USER INFO
  db.query("SELECT * FROM users WHERE username=?", [username], (err, userResult) => {

    if (err || userResult.length === 0) {
      return res.send("❌ User not found");
    }

    const user = userResult[0];

    // ACTIVITY
    db.query(`
      SELECT b.book_name, i.issue_date, i.return_date, i.due_date
      FROM issued_books i
      JOIN books b ON i.book_id = b.id
      WHERE i.student_name = ?
    `, [username], (err, activityRaw) => {

      const today = new Date();

      const activity = activityRaw.map(item => {

        let status = 'Active';
        let fine = 0;

        if (item.return_date) {
          status = 'Returned';
        }

        if (item.due_date) {
          const due = new Date(item.due_date);

          if (!item.return_date && due < today) {
            status = 'Overdue';

            const days = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
            fine = days * 5;
          }
        }

        return { ...item, status, fine };
      });

      res.render('userActivity', {
        user,
        activity,
        current: 'users',
        role: 'admin'
      });

    });

  });

});

module.exports = router;