const router = require('express').Router();
const db = require('../config/db');
const check = require('../middleware/authMiddleware');


// ==============================
// 📚 VIEW BOOKS (ROLE BASED)
// ==============================
router.get('/books', check, (req, res) => {

  db.query("SELECT * FROM books", (err, books) => {

    if (err) {
      console.log(err);
      return res.send("❌ Error loading books");
    }

    // 👨‍💼 ADMIN VIEW (table + controls)
    if (req.session.role === 'admin') {

      res.render('books', {
        books,
        current: 'books',
        role: 'admin'
      });

    }

    // 👤 USER VIEW (card UI)
    else {

      res.render('userBooks', {   // ✅ your new page
        books,
        current: 'books',
        role: 'user'
      });

    }

  });

});


// ==============================
// ➕ ADD BOOK (ADMIN ONLY)
// ==============================
router.post('/books/add', check, (req, res) => {

  if (req.session.role !== 'admin') {
    return res.send("❌ Access Denied");
  }

  const { book_name, author, quantity, image } = req.body;

  db.query(
    "INSERT INTO books (book_name, author, quantity, image) VALUES (?, ?, ?, ?)",
    [book_name, author, quantity, image],
    (err) => {

      if (err) {
        console.log(err);
        return res.send("❌ Failed to add book");
      }

      res.redirect('/books');

    }
  );

});


// ==============================
// ✏️ EDIT BOOK (ADMIN)
// ==============================
router.get('/books/edit/:id', check, (req, res) => {

  if (req.session.role !== 'admin') {
    return res.send("❌ Access Denied");
  }

  db.query("SELECT * FROM books WHERE id=?", [req.params.id], (err, result) => {

    if (err) {
      console.log(err);
      return res.send("❌ Error fetching book");
    }

    res.render('editBook', {
      book: result[0],
      current: 'books',
      role: 'admin'
    });

  });

});


// ==============================
// 💾 UPDATE BOOK
// ==============================
router.post('/books/edit/:id', check, (req, res) => {

  if (req.session.role !== 'admin') {
    return res.send("❌ Access Denied");
  }

  const { book_name, author, quantity, image } = req.body;

  db.query(
    "UPDATE books SET book_name=?, author=?, quantity=?, image=? WHERE id=?",
    [book_name, author, quantity, image, req.params.id],
    (err) => {

      if (err) {
        console.log(err);
        return res.send("❌ Failed to update book");
      }

      res.redirect('/books');

    }
  );

});


// ==============================
// ❌ DELETE BOOK
// ==============================
router.get('/books/delete/:id', check, (req, res) => {

  if (req.session.role !== 'admin') {
    return res.send("❌ Access Denied");
  }

  db.query("DELETE FROM books WHERE id=?", [req.params.id], (err) => {

    if (err) {
      console.log(err);
      return res.send("❌ Failed to delete book");
    }

    res.redirect('/books');

  });

});


module.exports = router;