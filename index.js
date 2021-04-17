const express = require('express');
const connectDB = require("./config/db");
const stationModel = require("./models/station");
const adminModel = require("./models/admin");
const passport = require("passport");
const passport1 = require("passport");
const app = express();
const passportlocal = require("passport-local-mongoose")
var LocalStrategy = require('passport-local').Strategy;
var LocalStrategy1 = require('passport-local').Strategy;
const path = require("path")
// Connect Database
connectDB();

  // app.set("view engine", "ejs");
  // app.set("views", path.join(__dirname, "views"));
  // app.use(express.static(path.join(__dirname, "public")));
  
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(
  require("express-session")({
    secret: "I am The Team",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());


passport.use('station', new LocalStrategy(stationModel.authenticate()));
passport.use('admin', new LocalStrategy(adminModel.authenticate()));

passport.serializeUser(function(user, done) { 
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  if(user!=null)
    done(null,user);
});



// passport.serializeUser(stationModel.serializeUser());
// passport.deserializeUser(stationModel.deserializeUser());

// passport1.serializeUser(adminModel.serializeUser());
// passport1.deserializeUser(adminModel.deserializeUser());

app.get("/", (req,res)=> {
  res.send("APi is runing");;
});

// Define Routes 
app.use("/",require("./routes/admin"));
app.use("/station", require("./routes/profile"));


app.all("*",(req,res)=>{
  res.send("404 Not Found")
  })
const PORT = process.env.PORT || 5000;

app.listen(PORT,()=> 
{
    console.log(`Server started on port ${PORT}`)})