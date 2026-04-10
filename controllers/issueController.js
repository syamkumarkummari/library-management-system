const db = require('../config/db');

// 📄 Load Issue Page
exports.issuePage = (req, res) => {
  db.query("SELECT * FROM books", (err, books) => {

    db.query(`
      SELECT issued_books.*, books.book_name 
      FROM issued_books 
      JOIN books ON issued_books.book_id = books.id
      WHERE return_date IS NULL
    `, (err, issued) => {

      res.render('issue', {
        books,
        issued,
        current: 'issue',
        role: req.session.role   // ✅ ADD THIS
      });
    });

  });
};

// 📥 Issue Book
exports.issueBook = (req, res) => {
  const { student_name, book_id, quantity, due_date } = req.body;

  db.query("SELECT quantity FROM books WHERE id=?", [book_id], (err, result) => {

    if (result[0].quantity >= quantity) {

      db.query(
  "INSERT INTO issued_books (book_id, student_name, quantity, issue_date, due_date) VALUES (?, ?, ?, CURDATE(), ?)",
  [book_id, student_name, quantity, due_date]
);

      db.query(
        "UPDATE books SET quantity = quantity - ? WHERE id=?",
        [quantity, book_id]
      );

      res.redirect('/issue');

    } else {
      res.send("Not enough stock!");
    }
  });
};

// 🔄 Return Book
exports.returnBook = (req, res) => {
  const id = req.params.id;

  db.query("SELECT book_id, quantity FROM issued_books WHERE id=?", [id], (err, result) => {

    const book_id = result[0].book_id;
    const qty = result[0].quantity;

    db.query(
      "UPDATE issued_books SET return_date=CURDATE() WHERE id=?",
      [id]
    );

    db.query(
      "UPDATE books SET quantity = quantity + ? WHERE id=?",
      [qty, book_id]
    );

    res.redirect('/issue');
  });
};