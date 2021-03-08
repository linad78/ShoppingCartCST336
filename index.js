const express = require("express");
const app = express();
const session = require("express-session");
const bcrypt = require("bcrypt");
const mysql = require("mysql");

// global connection object so that method can share it
let conn;

app.set("view engine", "ejs");

app.use(
  session({
    secret: "Unicorn!",
    resave: false,
    saveUnitialized: true,
  })
);
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.render("login");
});

// Movie store
app.get("/displayMovie", async (req, res) => {
  res.render("displayMovie");
});

// Shopping cart
app.get("/cart", (req, res) => {
  res.render("cart");
});

// Login
app.post("/", async (req, res) => {
  let username = req.body.username;
  let userPassword = req.body.password;

  let result = await checkUsername(username);

  let password = "$2a$10$LH07sO0xioh7EfukesR3Yeh2a9j7VbKJijZMS6tY6QYgXXzOd58RG"; //secret hashed bycrpt password

  let passwordMatch = await bcrypt.compare(userPassword, password);
  passwordMatch = true;

  req.session.authenticated = false;
  if (passwordMatch) {
    console.log(`User: ${username} logged in`);
    req.session.authenticated = true;
    res.render("displayMovie");
  } else {
    res.render("login", { loginError: true });
  }
});

// Account info
app.get("/account", isAuthenticated, (req, res) => {
  if (req.session.authenticated) {
    res.render("account");
  } else {
    res.redirect("/");
  }
});

// view movies
app.get("/viewMovies", async (req, res) => {
  // var conn = createDBConnection();

  let sql = "SELECT idmovie, title, producer, rating FROM movie ORDER BY title";
  // let rows = await executeSQL(sql);

  conn.query(sql, (err, result) => {
    if (err) throw err;
    res.render("viewMovies", { movies: result });
  });
});

// Deletes a movie  passed a movie ID if the user is authenticated.
app.get("/deleteMovie", isAuthenticated, (req, res) => {
  // var conn = createDBConnection();

  var sql = "DELETE FROM movie where idmovie = ?";
  var sqlParams = [req.query.idmovie];

  conn.query(sql, sqlParams, (err, result) => {
    if (err) throw err;
  });

  res.send("it works!");
});

// Add a movie
app.get("/addMovie", isAuthenticated, function (req, res) {
  // var conn = createDBConnection();

  var sql = "INSERT INTO movie (title, producer, rating) values (?,?,?)";

  
  // var title = parseFloat(req.query.title);
  // var producer = parseInt(req.query.producer);
  // var rating = parseInt(req.query.rating);

  var sqlParams = [req.query.title, req.query.producer, req.query.rating];

  conn.query(sql, sqlParams, function (err, result) {
    if (err) throw err;
    console.log("adding movie: ", req.query.title);
    res.send("movie added!");
  });
});

// Logout from session
app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

// Get all movies
app.get("/getAllMovies", (req, res) => {
  // var conn = createDBConnection();

  //var sql = "SELECT * from movie order by title"
  var sql =
    "SELECT title, producer, rating FROM movie JOIN movie  ORDER BY b.title";

  conn.query(sql, function (err, results) {
    if (err) throw err;
    res.send(results);
  });
});

// Search movies by Title
app.get("/getproducer", (req, res) => {
  // var conn = createDBConnection();

  var sql = "SELECT title, producer FROM movie  ORDER BY producer";
  var sqlParams = [req.query.title];

  conn.query(sql, sqlParams, function (err, results) {
    if (err) throw err;
    console.log(results);
    res.send(results);
  });
});

// Search movie by producer
app.get("/getrating", (req, res) => {
  // var conn = createDBConnection();

  var sql = "SELECT title, rating from movie GROUP BY idmovie ORDER BY b.title";
  var sqlParams = [req.query.title, req.query.rating];

  conn.query(sql, sqlParams, function (err, results) {
    if (err) throw err;
    console.log(results);
    res.send(results);
  });
});

// middleware function for all pages wew need it to be password protected/middleware function
function isAuthenticated(req, res, next) {
  if (!req.session.authenticated) {
    res.render("login");
  } else {
    next(); //excute the code we have in the route
  }
}

function createDBConnection() {
  var conn = mysql.createConnection({
    host: "eyw6324oty5fsovx.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "zv9hwbdttcvzdxhe",
    password: "wo0rlehi0pg4vecv",
    database: "gsap0yb4s675q2ph",
  });
  return conn;
} //create DB connection

function checkUsername(username) {
  let sql = "SELECT * FROM users WHERE username = ?";
  return new Promise(function (resolve, reject) {
    conn.query(sql, [username], function (err, rows, fields) {
      if (err) throw err;
      resolve(rows);
    });
  });
}

function checkPassword(password, hashedPW) {
  return new Promise(function (resolve, reject) {
    bcrypt.compare(password, hashedPW, function (err, result) {
      console.log("Password: " + password);
      console.log("hashedPW: " + hashedPW);
      console.log("Result: " + result);
      resolve(result);
    });
  });
}

function isAuthenticated(req, res, next) {
  if (!req.session.authenticated) {
    res.redirect('/');
  } else {
    next();
  }
}

const PORT = process.env.Port ||3001;
app.listen(PORT, () => {
  // Creating connection
  conn = createDBConnection();
  conn.connect(function (err) {
    if (err) throw err;
  });
  console.log('Express server is running');
});

// let port =process.env.PORT || 3001;

// // //Heroku Listener
// app.listen(port,()=>{
//     console.log(`Express Server is Running...${port}`);

// });