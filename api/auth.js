const express = require("express");
const router = express.Router();

router.post();

// logout user
router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

// process the login form
app.post(
  "/login",
  passport.authenticate("local-login", {
    successRedirect: "/profile", // redirect to the secure profile section
    failureRedirect: "/login", // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  })
);

// process the signup form
app.post(
  "/signup",
  passport.authenticate("local-signup", {
    successRedirect: "/profile", // redirect to the secure profile section
    failureRedirect: "/signup", // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  })
);

module.exports = router;