const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const userModel = require("../models/user.js");
const { setPrevDetails } = require("../middlewares/flash-setup.js");

const router = express.Router();

router.get("/register", setPrevDetails, (req, res) => {
   res.render("register", {
      title: "Register",
   });
});

router.get("/login", (req, res) => {
   res.render("login", {
      title: "Login",
   });
});

router.post("/register", async (req, res) => {
   const { name, email, password1, password2, profilePicture } = req.body;
   const errors = [];
   if (!(name && email && password1 && password2)) {
      errors.push({ error: "Fill all the fields" });
   }
   if (password1 != password2) {
      errors.push({ error: "Passwords does not match" });
   } else if (password1.length < 8) {
      errors.push({
         error: "Passwords should be more than 8 characters long.",
      });
   }
   if (email) {
      try {
         const user = await userModel.findOne({ email });
         if (user) {
            errors.push({
               error: "User with same Email ID already exists, try again with another Email.",
            });
         }
      } catch (err) {
         console.log(err);
         errors.push({ error: "User check failed" });
      }
   }
   if (errors.length == 0) {
      try {
         const hash = await bcrypt.hash(password1, 10);
         const newUser = new userModel({
            name,
            email,
            hash,
            profilePicture,
         });
         await newUser.save();
         req.flash(
            "registeredMsg",
            "You have successfully registered and can now login."
         );
         return res.redirect("/login");
      } catch (err) {
         console.log(err);
         errors.push({ error: "Cannot register user try again later" });
      }
   }
   req.flash("prevDetails", {
      name,
      email,
      profilePicture,
      password1,
      password2,
      errors,
   });
   res.redirect("/register");
});

router.post(
   "/login",
   passport.authenticate("local", {
      successRedirect: "/dashboard",
      failureRedirect: "/login",
      successFlash: true,
      failureFlash: true,
   })
);

router.get("/logout", (req, res) => {
   req.logout();
   res.redirect("/login");
});

module.exports = router;
