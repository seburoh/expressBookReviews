const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length == 0;
}

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in, username or password not provided." });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    // Store access token and username in session
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn.trim();
  const review = req.body.review.trim();
  const user = req.session.authorization?.username;

  if (!isbn || !review) {
    return res.status(400).json({ message: "ISBN and review are required" });
  } else if (!books[isbn]) {
    return res.status(404).json({ message: `No book found with ISBN ${isbn}` });
  }

  books[isbn].reviews[user] = review;
  return res.status(200).json({ message: `Review posted for ${user} on ISBN ${isbn}` });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn.trim();
  const user = req.session.authorization?.username;

  if (!isbn) {
    return res.status(400).json({ message: "ISBN is required" });
  } else if (!books[isbn]) {
    return res.status(404).json({ message: `No book found with ISBN ${isbn}` });
  } else if (!books[isbn].reviews[user]) {
    return res.status(404).json({ message: `User ${user} has no reviews for ISBN ${isbn}` });
  }

  delete books[isbn].reviews[user];
  return res.status(200).json({ message: `Review deleted for ${user} on ISBN ${isbn}` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
