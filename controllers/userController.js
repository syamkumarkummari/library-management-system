const db = require('../config/db');

// 👤 USER DASHBOARD
exports.dashboard = (req, res) => {

  const username = req.session.user;

  // Total borrowed
  db.query(
    "SELECT COUNT(*) AS total FROM issued_books WHERE student_name=?",
    [username],
    (e, total) => {

      // Currently issued
      db.query(
        "SELECT COUNT(*) AS issued FROM issued_books WHERE student_name=? AND return_date IS NULL",
        [username],
        (e, issued) => {

          // Overdue
          db.query(
            "SELECT COUNT(*) AS overdue FROM issued_books WHERE student_name=? AND return_date IS NULL AND due_date < CURDATE()",
            [username],
            (e, overdue) => {

              // Issued books list
              db.query(`
                SELECT issued_books.*, books.book_name 
                FROM issued_books 
                JOIN books ON issued_books.book_id = books.id
                WHERE student_name=? AND return_date IS NULL
              `, [username], (e, issuedBooks) => {

                res.render('userDashboard', {
                  total: total[0].total,
                  issued: issued[0].issued,
                  overdue: overdue[0].overdue,
                  fine: overdue[0].overdue * 10, // ₹10/day simple logic
                  issuedBooks,
                  current: 'dashboard',
                  role: req.session.role
                });

              });

            });

        });

    });

};

// 📚 USER BOOK LIST
exports.books = (req, res) => {

  db.query("SELECT * FROM books", (err, books) => {

    res.render('userBooks', {
      books,
      current: 'books',
      role: req.session.role
    });

  });

};
// ✏️ SHOW EDIT PAGE
exports.editProfilePage = (req, res) => {

  const username = req.session.user;

  db.query("SELECT * FROM users WHERE username=?", [username], (err, result) => {

    res.render('editProfile', {
      user: result[0],
      current: 'profile',
      role: 'user'
    });

  });

};

// 💾 UPDATE PROFILE
exports.updateProfile = (req, res) => {

  const username = req.session.user;

  const { full_name, reg_no, dept, year } = req.body;

  db.query(
    "UPDATE users SET full_name=?, reg_no=?, dept=?, year=? WHERE username=?",
    [full_name, reg_no, dept, year, username],
    (err) => {
      if (err) throw err;
      res.redirect('/user/profile');
    }
  );

};

// 📖 BOOK DETAILS PAGE
exports.bookDetails = (req, res) => {

  db.query("SELECT * FROM books WHERE id=?", [req.params.id], (err, data) => {

    if (err) return res.send("DB Error");

    res.render('userBookDetails', {
      book: data[0],
      current: 'books',
      role: req.session.role
    });

  });

};