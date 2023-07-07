const express = require("express");
const mongoose = require("mongoose");
const blogModel = require("../models/blog.js");
const upload = require("../config/multer.js");
const { setPrevDetails } = require("../middlewares/flash-setup.js");
const isValidMongooseId = require("../middlewares/mongooseIdCheck.js");
const {
   isAuthenticated,
   isOwner,
   checkPrivateBlog,
} = require("../middlewares/auth.js");
const serverError = require("../config/serverError.js");

const router = express.Router();

router.get("/add", isAuthenticated, setPrevDetails, (req, res) => {
   res.render("addEditBlog.hbs", {
      title: "New Blog",
      layout: "editor",
   });
});

router.get(
   "/edit/:id",
   isAuthenticated,
   isValidMongooseId,
   isOwner,
   (req, res) => {
      const blog = req.blog;

      res.render("addEditBlog", {
         id: blog.id,
         layout: "editor",
         title: "Edit",
         image: blog.image,
         blogTitle: blog.title,
         status: blog.status,
         body: blog.body,
      });
   }
);

router.get(
   "/:id",
   isValidMongooseId,
   checkPrivateBlog,
   async (req, res, next) => {
      const blog = req.blog;
      res.render("blog", {
         ...blog,
         profilePicture: `${process.env.DICE_BEAR}${blog.user.profilePicture}.svg`,
         canEdit: req.isAuthenticated() ? req.user.id == blog.user._id : false,
      });
   }
);

router.post(
   "/add",
   isAuthenticated,
   upload.single("image"),
   async (req, res, next) => {
      const { title, status, body, length } = req.body;
      const errors = [];
      if (!req.blogImage) errors.push({ error: "Add an image for the blog." });
      if (!title) {
         errors.push({ error: "Title is required for a blog." });
      }
      if (!status) {
         errors.push({ error: "Status is required for a blog." });
      }
      if (length <= 1) {
         errors.push({ error: "Body is required for a blog." });
      }

      if (errors.length != 0) {
         req.flash("prevDetails", {
            blogTitle: title,
            status,
            body,
            errors,
         });
         return res.redirect("/blog/add");
      }

      try {
         const blog = new blogModel({
            title,
            status,
            body,
            image: req.blogImage
               ? `/images/${req.blogImage}`
               : req.file?.location,
            user: req.user.id,
         });
         const newblog = await blog.save();
         res.redirect(`/blog/${newblog.id}`);
      } catch (err) {
         console.log(err);
         next(
            new serverError(500, "Some error occured, could not add the blog.")
         );
      }
   }
);

router.post(
   "/edit/:id",
   isAuthenticated,
   isValidMongooseId,
   upload.single("image"),
   isOwner,
   async (req, res, next) => {
      const { title, status, body, length } = req.body;
      const errors = [];
      const blog = req.blog;

      if (!title) {
         errors.push({ error: "Title is required for a blog." });
      }
      if (!status) {
         errors.push({ error: "Status is required for a blog." });
      }
      if (length <= 1) {
         errors.push({ error: "Body is required for a blog." });
      }
      if (errors.length != 0) {
         req.flash("prevDetails", {
            blogTitle: title,
            status,
            body,
            image: blog.image,
            errors,
         });
         return res.redirect(`/blog/edit/${req.params.id}`);
      }
      try {
         blog.title = title;
         blog.status = status;
         blog.body = body;
         blog.image = (
            req.blogImage ? `/images/${req.blogImage}` : req.file?.location
         )
            ? `/images/${req.blogImage}`
            : blog.image;
         const newBlog = await blog.save();
         res.redirect(`/blog/${newBlog.id}`);
      } catch (err) {
         console.log(err);
         next(
            new serverError(500, "Some error occured. Could not edit the blog.")
         );
      }
   }
);

module.exports = router;
