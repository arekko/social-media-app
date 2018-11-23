var multer = require("multer");
const db = require("../utils/database");
// const connection = db.createConnection();
const uuidv4 = require("uuid/v4");
const passport = require("passport");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function(req, file, cb) {
    cb(null, `original-img:${file.originalname}`);
  }
});

var upload = multer({ storage: storage });

// const upload =  multer({ dest: 'public/uploads'})

const express = require("express");
const router = express.Router();
const path = require("path");


// route middleware to make sure a user is logged in
const isLoggedIn = (req, res, next) => {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();

  // if they aren't redirect them to the home page
  res.redirect("/login");
}



router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public/index.html"));
});

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public/login.html"));
});

// process the login form
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile", // redirect to the secure profile section
    failureRedirect: "/login" // redirect back to the signup page if there is an error
    // failureFlash: true // allow flash messages
  })
);

router.post("/registration", upload.single("avatar"), async (req, res) => {
  const connection = await db.createConnection();

  const email = req.body.email;
  const username = req.body.username;

  const userId = uuidv4();
  const userData = [];
  userData.push(userId);
  userData.push(req.body.username);
  userData.push(req.body.firstname);
  userData.push(req.body.lastname);
  userData.push(req.body.email);
  userData.push(req.body.password);
  userData.push(
    `http://localhost:3000/uploads/original-img:${req.file.originalname}`
  );

  const [usernameRows] = await connection.execute(
    "SELECT * FROM user WHERE username = ?",
    [username]
  );

  const [emailRows] = await connection.execute(
    "SELECT * FROM user WHERE email = ?",
    [email]
  );

  if (usernameRows.length > 0) {
    res.send({
      message: "error",
      error: "Username already exists"
    });
  } else if (emailRows.length > 0) {
    res.send({
      message: "error",
      error: "Email already exists"
    });
  } else {
    await connection.execute(
      "Insert INTO user (uId, username, firstname, lastname, email, password, avatar_url) VALUES (?,?,?,?,?,?,?)",
      userData
    );
    res.send({
      message: "success",
      error: null
    });
  }
});

router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

router.get("/registration", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public/registration.html"));
});

router.get("/profile", isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public/profile.html"));
});





module.exports = router;