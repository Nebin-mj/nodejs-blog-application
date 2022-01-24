const serverError = require("../config/serverError.js");

const errorMiddleware = (err, req, res, next) => {
   if (err instanceof serverError) {
      res.status(err.status).render("error", {
         title: "Error",
         status: err.status,
         message: err.message,
      });
   } else {
      console.log(err);
      res.status(500).render("error", {
         title: "Error",
         status: 500,
         message: "Internal Server Error",
      });
   }
};

module.exports = errorMiddleware;
