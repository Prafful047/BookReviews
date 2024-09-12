const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if the username already exists in the users array
  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists." });
  }

  // Register the new user (push to users array)
  users.push({ username, password });

  // Respond with a success message
  return res.status(201).json({ message: "User registered successfully!" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
   // Retrieve the list of books from the books database
   let bookList = books;

   // Return the list of books as a formatted JSON response
   return res.status(200).send(JSON.stringify(bookList, null, 4)); // 'null, 4' ensures neat formatting with indentation
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  // Find the book in the books database using the ISBN
  const book = books[isbn];

  // If the book is found, return the book details
  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4)); // Neatly formatted output
  } else {
    // If the book is not found, return a 404 error
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

  // Initialize an array to hold books by the given author
  let booksByAuthor = [];

  // Iterate through the books object to find books by the author
  Object.keys(books).forEach(isbn => {
    if (books[isbn].author === author) {
      booksByAuthor.push(books[isbn]); // Add the book to the array if the author matches
    }
  });

  // If any books are found, return them
  if (booksByAuthor.length > 0) {
    return res.status(200).send(JSON.stringify(booksByAuthor, null, 4)); // Neatly formatted output
  } else {
    // If no books are found by the author, return a 404 error
    return res.status(404).json({ message: `No books found by author ${author}.` });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;

  // Initialize an array to hold books by the given title
  let booksByTitle = [];

  // Iterate through the books object to find books by the title
  Object.keys(books).forEach(isbn => {
    if (books[isbn].title === title) {
      booksByTitle.push(books[isbn]); // Add the book to the array if the title matches
    }
  });

  // If any books are found, return them
  if (booksByTitle.length > 0) {
    return res.status(200).send(JSON.stringify(booksByTitle, null, 4)); // Neatly formatted output
  } else {
    // If no books are found by the title, return a 404 error
    return res.status(404).json({ message: `No books found with title ${title}.` });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  // Find the book in the books database using the ISBN
  const book = books[isbn];

  // If the book is found, return the reviews
  if (book && book.reviews) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4)); // Neatly formatted output
  } else {
    // If the book or its reviews are not found, return a 404 error
    return res.status(404).json({ message: `Reviews for book with ISBN ${isbn} not found.` });
  }
});

module.exports.general = public_users;
