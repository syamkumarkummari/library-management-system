const db = require('../config/db');

// 📚 Get Books
exports.getBooks = (req, res) => {
  db.query("SELECT * FROM books", (err, data) => {
    res.render('books', {
      books: data,
      current: 'books',
      role: req.session.role
    });
  });
};

// ➕ Add Book
exports.addBook = (req, res) => {
  const { book_name, author, quantity, image } = req.body;

  db.query(
    "INSERT INTO books (book_name, author, quantity, image) VALUES (?, ?, ?, ?)",
    [book_name, author, quantity, image],
    () => res.redirect('/books')
  );
};

// ✏️ LOAD EDIT PAGE
exports.editBookPage = (req, res) => {
  const id = req.params.id;

  db.query("SELECT * FROM books WHERE id=?", [id], (err, result) => {
    res.render('editBook', {
      book: result[0],
      current: 'books'
    });
  });
};

// 🔄 UPDATE BOOK
exports.updateBook = (req, res) => {
  const id = req.params.id;
  const { book_name, author, quantity, image } = req.body;

  db.query(
    "UPDATE books SET book_name=?, author=?, quantity=?, image=? WHERE id=?",
    [book_name, author, quantity, image, id],
    () => res.redirect('/books')
  );
};

// ❌ DELETE
exports.deleteBook = (req, res) => {
  db.query("DELETE FROM books WHERE id=?", [req.params.id], () => {
    res.redirect('/books');
  });
};