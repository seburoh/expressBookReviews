const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

function strEq(a, b) {
  return a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;
}

function findBooksBy(field, value) {
  return Object.values(books).filter(book => strEq(book[field], value));
}

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (isValid(username)) {
      // Add the new user to the users array
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }

  return res.status(404).json({ message: "Unable to register user name or password missing." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.send(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn.trim();

  if (!isbn) {
    return res.status(400).json({ message: "ISBN is required" });
  } else if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json(`No book with ISBN ${isbn}`);
  }
});

// Get books by author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.trim();
  if (!author) return res.status(400).json({ message: "Author is required" });

  const results = findBooksBy("author", author);
  if (results.length === 0) return res.status(404).json({ message: `No books found for author ${author}` });

  return res.status(200).json(results);
});

// Get books by title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.trim();
  if (!title) return res.status(400).json({ message: "Title is required" });

  const results = findBooksBy("title", title);
  if (results.length === 0) return res.status(404).json({ message: `No books found for title ${title}` });

  return res.status(200).json(results);
});

// Get reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn.trim();

  if (!isbn) {
    return res.status(400).json({ message: "ISBN is required" });
  } else if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: `No book found with ISBN ${isbn}` });
  }
});

module.exports.general = public_users;
