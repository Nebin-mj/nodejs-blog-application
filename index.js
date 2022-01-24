require("dotenv").config();
const PORT = process.env.PORT || 5000;
process.env.DICE_BEAR = "https://avatars.dicebear.com/api/pixel-art/:";

const express = require("express");
const { create } = require("express-handlebars");
const flash = require("express-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");

const authRouter = require("./Routes/auth.js");
const userRouter = require("./Routes/user.js");
const blogRouter = require("./Routes/blog.js");
const indexRouter = require("./Routes/index.js");
const hbsConfig = require("./config/handlebars.js");
const { flashSetup } = require("./middlewares/flash-setup.js");
require("./config/mongoose.js");

const errorMiddleware = require("./middlewares/error.js");

const app = express();
const hbs = create(hbsConfig);

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");

const sessionStore = new MongoStore({
   mongoUrl: process.env.MONGO_URI,
   collectionName: "sessions",
});
app.use(
   session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      store: sessionStore,
      cookie: {
         maxAge: 1000 * 60 * 60 * 24,
         httpOnly: true,
      },
   })
);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport.js");
app.use(flashSetup);

app.use("/", authRouter);
app.use("/", userRouter);
app.use("/blog", blogRouter);
app.use("/", indexRouter);

app.all("*", (req, res) => {
   res.status(404).render("error", {
      title: "Error",
      status: 404,
      message: "The page you are looking for not found.",
   });
});

app.use(express.static("public"));

app.use(errorMiddleware);

app.listen(PORT, () => {
   console.log(`Server listening on port ${PORT}`);
});
