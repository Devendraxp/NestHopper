if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const port = 8080;
const dbUrl = process.env.ATLASDB_LINK;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const ExpressError = require("./ExpressError.js");
mongoose.set("strictPopulate", false);

// Connect to MongoDB
async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to Database Successfully");
}
main().catch((err) => console.log(err));

// Express configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl : dbUrl,
  crypto:{
    secret: process.env.SECRET,
  },
  touchAfter : 24 * 3600,
});

store.on("error", (err) =>{
  console.log("ERROR ! in mongo session store", err);
});

const sessionOptions = {
  store: store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};



app.get("/", (req, res) => {
  res.redirect("/listings");
});

//session & passport

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// listing route
app.use("/listings", listingsRouter);
// reviews route
app.use("/listings/:id/reviews", reviewsRouter);
// user route
app.use("/", userRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = res.statusCode || 500;
  res.status(statusCode).render("error.ejs", { err });
});

app.listen(port, () => {
  console.log(`App is listening on port: ${port}`);
});
