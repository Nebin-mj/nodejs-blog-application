const express = require("express");
const { isAuthenticated } = require("../middlewares/auth.js");
const isValidMongooseId = require("../middlewares/mongooseIdCheck.js");
const userModel = require("../models/user.js");
const blogModel = require("../models/blog.js");
const serverError = require("../config/serverError.js");

const router = express.Router();

router.get("/dashboard", isAuthenticated, async (req, res) => {
   try {
      const blogs = await blogModel
         .find({ user: req.user.id })
         .sort({ createdAt: "desc" })
         .lean();
      res.render("dashboard", {
         title: "Dashboard",
         name: req.user.name,
         email: req.user.email,
         profilePicture: `${process.env.DICE_BEAR}${req.user.profilePicture}.svg`,
         blogs,
      });
   } catch (err) {
      console.log(err);
   }
});

router.get("/users", async (req, res) => {
   try {
      const users = await userModel.find({}, { hash: 0 }).lean();
      res.render("users", {
         title: "Users",
         users,
      });
   } catch (err) {
      console.log(err);
   }
});

router.get("/users/:id", isValidMongooseId, async (req, res, next) => {
   if (req.isAuthenticated()) {
      if (req.params.id == req.user.id) {
         return res.redirect("/dashboard");
      }
   }
   try {
      const user = await userModel.findById(req.params.id).lean();
      if (!user) throw new serverError(404, "User not found.");
      const blogs = await blogModel
         .find({ user: req.params.id, status: "Public" })
         .lean();
      res.render("user-dashboard", {
         title: `Dashboard ${user.name}`,
         ...user,
         profilePicture: `${process.env.DICE_BEAR}${user.profilePicture}.svg`,
         blogs,
      });
   } catch (err) {
      console.log(err);
      next(err);
   }
});

module.exports = router;
