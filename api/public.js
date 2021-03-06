const isAdmin = require("../utils/middleware/isAdmin");
const multer = require("multer");
const sharp = require("../utils/sharp");
const formatter = require("../utils/timeFormat");
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/images/event_cover_img/original");
  },
  filename: function(req, file, cb) {
    cb(null, `original:${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

const constant = require("../constants");

const isLoggedIn = require("../utils/middleware/isLoggedIn");
const User = require("../models/userModel");
// const upload =  multer({ dest: 'public/uploads'})
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const path = require("path");
const uuid = require("uuid/v4");
const Event = require("../models/eventModel");

router.get("/", async (req, res) => {
  const cardInfo = await Event.getEventsForCards();
  cardInfo.forEach(card => {
    card.short_date = formatter.shortDate(card.event_date);
    card.date = formatter.date(card.event_date);
  });
  console.log(cardInfo);

  res.render("homepage", {
    user: req.user,
    cardInfo
  });
});

// router.get("/", (req, res) => {
//   console.log(req.user)
//   res.sendFile(path.join(__dirname, "..", "public/index.html"));
// });

router.get("*/login", (req, res) => {
  if (req.user) {
    res.redirect("/");
  } else {
    res.render("login", {
      message: req.flash("loginMessage")
    });
  }
});

/*
 * @GET /logout
 * @desc logout user route
 *
 *
 **/
router.get("*/logout", async (req, res) => {
  await User.updateCurrentDate(req.user.uId, "last_logout_date");
  req.logout();
  res.redirect("/");
});

/*
 * @GET /registration
 * @desc logout user route
 *
 *
 **/
router.get("*/registration", (req, res) => {
  if (req.user) {
    res.redirect("/");
  } else {
    res.render("register", {
      message: req.flash("signupMessage")
    });
  }
});

router.get("/profile/:id", isLoggedIn, async (req, res) => {
  const user = req.user;
  const currentUserId = req.user.uId;
  const profileId = req.params.id;
  const userProfile = await User.getUserById(req.params.id);
  if (!userProfile) {
    res.status(404);
  }
  console.log(userProfile);

  if (currentUserId === profileId) {
    res.render("profile", {
      user: req.user,
      userpr: userProfile[0],
      canUpdate: true
    });
  } else {
    res.render("profile", {
      user: req.user,
      userpr: userProfile[0],
      canUpdate: false
    });
  }
});

router.get("/edit-profile", isLoggedIn, (req, res) => {
  res.render("edit-profile", {
    user: req.user,
    message: req.flash("username-error")
  });
});

router.post("/edit-profile", isLoggedIn, async (req, res) => {
  //  console.log(req.body)
  const changeData = req.body;

  if (changeData.username) {
    const user = await User.getUserByUsername(changeData.username);
    if (user.length > 0) {
      req.flash("username-error", "This username already exists");
      res.redirect("/edit-profile");
    }
  }

  let updateUser = {};

  for (let i in changeData) {
    console.log(i);
    if (changeData[i] !== "") {
      updateUser[i] = changeData[i];
    }
  }
  await User.updateCurrentUser(req.user.uId, updateUser);
  res.redirect(`/profile/${req.user.uId}`);
});

router.get("/change-password", isLoggedIn, (req, res) => {
  res.render("change-password", {
    user: req.user,
    message: req.flash("changepass")
  });
});

router.post("/change-password", isLoggedIn, async (req, res) => {
  const userId = req.user.uId;
  console.log(req.body);
  let hashPassword;
  try {
    hashPassword = await bcrypt.hash(req.body.newpass, 10);
  } catch (e) {
    console.error(e);
  }
  const user = await User.getUserById(userId);
  console.log(user[0].password);
  const match = await bcrypt.compare(req.body.currentpass, user[0].password);
  if (match) {
    await User.updateCurrentUser(userId, {
      password: hashPassword
    });
    res.redirect(`/profile/${userId}`);
  } else {
    req.flash("changepass", "Incorrect old password");
    res.redirect("/change-password");
  }
});

// Add new event
router.get("/create-event", isLoggedIn, (req, res) => {
  res.render("create-event", {
    user: req.user,
    message: req.flash("create-event")
  });
});

router.post("/create-event", upload.single("event"), (req, res, next) => {
  console.log(req.body);
  console.log(req);
  if (req.file) {
    sharp.resizeImg(
      req.file.path,
      400,
      `public/images/event_cover_img/card/card:${req.file.originalname}`,
      next
    );
  } else {
    next();
  }
});

router.use("/create-event", isLoggedIn, async (req, res) => {
  const userId = req.user.uId;
  const eventData = req.body;
  eventData.eId = uuid();
  eventData.creater_id = userId;
  eventData.photo_original_url = `${
    constant.HOST_URL
  }/images/event_cover_img/original/original:${req.file.originalname}`;
  eventData.photo_card_url = `${
    constant.HOST_URL
  }/images/event_cover_img/card/card:${req.file.originalname}`;
  await Event.addEvent(eventData);
  res.redirect("/");
});

router.get("/event/:id", async (req, res) => {
  const eventId = req.params.id;
  const row = await Event.getEventById(eventId);
  event = row[0];
  event.time = formatter.time(event.event_date);
  event.date = formatter.date(event.event_date);
  res.render("event-page", { user: req.user, event: event });
});

/*
 * @Delete registration
 * @desc logout user route
 *
 *
 **/
router.get("/delete-profile", isLoggedIn, async (req, res) => {
  const userId = req.user.uId;
  await User.deleteUserById(userId);
  req.logout();
  res.redirect("/");
});

router.get("/dashboard", isAdmin, (req, res) => {
  res.render('dashboard', {
    user: req.user
  })
});

module.exports = router;
