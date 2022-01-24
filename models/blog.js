const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
   {
      title: {
         type: String,
         required: true,
      },
      status: {
         type: String,
         enum: ["Public", "Private"],
         required: true,
      },
      body: {
         type: String,
         required: true,
      },
      image: {
         type: String,
         required: false,
      },
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "user",
         required: true,
      },
   },
   {
      timestamps: true,
   }
);

const userModel = mongoose.model("blog", blogSchema);
module.exports = userModel;
