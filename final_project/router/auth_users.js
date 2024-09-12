const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
  "username": "user1",
  "password": "password1"
}];

// Add session support
// regd_users.use(session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Function to check if the username is valid
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Function to authenticate user
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Task 7: Login endpoint for registered users
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Validate if the user exists and credentials are correct
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password." });
    }

    // Create a JWT token
    const token = jwt.sign({ username }, 'fingerprint_customer', { expiresIn: '1h' });

    // Store the token in session
    req.session.token = token;

    console.log("Token stored in session:", req.session.token);

    return res.status(200).json({ message: "Login successful", token });
});

// Middleware to authenticate using JWT
const authenticateJWT = (req, res, next) => {
    const token = req.session.token;

    if (token) {
        jwt.verify(token, 'fingerprint_customer', (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Invalid or expired token." });
            }
            req.user = user; // Store user info in request
            next();
        });
    } else {
        return res.status(401).json({ message: "Authorization required." });
    }
};

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", authenticateJWT, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.user.username;

    if (!review) {
        return res.status(400).json({ message: "Review content is required." });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // If the review exists, modify it, otherwise add a new review
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/modified successfully", reviews: books[isbn].reviews });
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", authenticateJWT, (req, res) => {
    const { isbn } = req.params;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully." });
    } else {
        return res.status(404).json({ message: "Review not found for the user." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
