CREATE DATABASE library_db;
USE library_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    password VARCHAR(100)
);

INSERT INTO users (username, password)
VALUES ('admin', 'admin123');

CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_name VARCHAR(255),
    author VARCHAR(255),
    quantity INT
);

CREATE TABLE issued_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT,
    student_name VARCHAR(255),
    issue_date DATE,
    return_date DATE
);