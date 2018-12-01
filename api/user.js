const express = require("express");
const router = express.Router();
const isLoggedIn = require("../utils/middleware/isLoggedIn");
const User = require("../models/userModel");
// @route GET /current
// @desc return current user info
// @access private

// TODO dont send all data to the client!! fix it
router.get("/current", isLoggedIn, (req, res) => {
  res.json(req.user);
});

router.get("/users/:id", isLoggedIn, async (req, res) => {
  const userId = req.params.id;
  const user = await User.getUserById(userId);
  res.json(user);
});

router.get("/users", isLoggedIn, async (req, res) => {
  const users = await User.getUsers();
  res.json(users);
});
// TODO add isLogged in
router.delete("/users/:id", isLoggedIn, async (req, res) => {
  const userId = req.params.id;
  await User.deleteUserById(userId);

  res.redirect("/");
});

router.patch("/users", isLoggedIn, async (req, res) => {
  const userId = req.user.uId;

  await User.updateCurrentUser(userId, req.body);
  res.json({
    errors: null
  });
});
// TODO GET all users, getuserbyid, deleteuserbyid, updateuser


module.exports = router;
