const express = require("express");
const blogModel = require("../models/blog.js");

const router = express.Router();

router.get("/", async (req, res) => {
   try {
      const blogs = await blogModel
         .find({ status: "Public" })
         .populate("user", { name: 1, profilePicture: 1 })
         .sort({ createdAt: "desc" })
         .lean();
      res.render("index", {
         title: "Home",
         blogs,
         diceBear: process.env.DICE_BEAR,
      });
   } catch (err) {
      console.log(err);
   }
});

module.exports = router;
