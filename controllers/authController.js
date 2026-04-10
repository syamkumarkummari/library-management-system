const db = require('../config/db');

// ==========================
// 🔐 LOGIN PAGE
// ==========================
exports.loginPage = (req, res) => {
  res.render('login');
};

// ==========================
// 🔐 LOGIN LOGIC
// ==========================
exports.login = (req, res) => {

  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username=? AND password=?",
    [username, password],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.send("❌ Database error");
      }

      if (result.length === 0) {
        return res.send("❌ Invalid login");
      }

      const user = result[0];

      // ✅ SESSION
      req.session.user = user.username;
      req.session.role = user.role;

      // ✅ REDIRECT
      if (user.role === 'admin') {
        res.redirect('/dashboard');
      } else {
        res.redirect('/user/dashboard');
      }

    }
  );

};

// ==========================
// 🏠 ADMIN DASHBOARD
// ==========================
exports.dashboard = (req, res) => {

  // 📚 GET BOOKS
  db.query("SELECT * FROM books", (err, books) => {

    if (err) {
      console.log(err);
      return res.send("❌ Error loading books");
    }

    // 📊 TOTAL BOOKS
    db.query("SELECT COUNT(*) AS totalBooks FROM books", (err, totalRes) => {

      if (err) {
        console.log(err);
        return res.send("❌ Error fetching total books");
      }

      // 📊 ISSUED BOOKS
      db.query(
        "SELECT COUNT(*) AS issued FROM issued_books WHERE return_date IS NULL",
        (err, issuedRes) => {

          if (err) {
            console.log(err);
            return res.send("❌ Error fetching issued books");
          }

          // 👥 TOTAL USERS
          db.query(
            "SELECT COUNT(*) AS users FROM users WHERE role='user'",
            (err, usersRes) => {

              if (err) {
                console.log(err);
                return res.send("❌ Error fetching users");
              }

              // ⏰ OVERDUE BOOKS
              db.query(`
                SELECT COUNT(*) AS overdue 
                FROM issued_books 
                WHERE return_date IS NULL AND due_date < CURDATE()
              `, (err, overdueRes) => {

                if (err) {
                  console.log(err);
                  return res.send("❌ Error fetching overdue");
                }

                // ✅ FINAL RENDER
                res.render('dashboard', {
                  books: books,

                  totalBooks: totalRes[0].totalBooks,
                  issued: issuedRes[0].issued,
                  available: totalRes[0].totalBooks - issuedRes[0].issued,
                  totalUsers: usersRes[0].users,
                  overdue: overdueRes[0].overdue,

                  current: 'dashboard',
                  role: 'admin'
                });

              });

            }
          );

        }
      );

    });

  });

};

// ==========================
// 🚪 LOGOUT
// ==========================
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};