const express = require("express")
const router = express.Router();

const stations = require("../models/station")
const config = require('config')
const auth = require("../middleware/auth")
const admindb = require("../models/admin")
const passport= require("passport")
const logger = false;

// Login Middleware 
function isLoggedIn(req, res, next) {
  console.log("From isLoggedIn")
  if (req.isAuthenticated()) {
    if(req.user.isAdmin)
      return next();
  }
  res.send("Not Authorized")
  // res.redirect("/login");
}

router.post(
  "/login_admin",
  passport.authenticate("admin", {
    successRedirect: "/admin",
    failureRedirect: "/login",
  }),
  function (req, res) {
    
  }
);

router.get("/admin", (req,res)=>{
  console.log("From admin")
  res.json({status:"succesful"});
})

router.get("/login", (req,res)=>{
  console.log("From login")
  res.json({status:"Invalid vv credentials"});
})

// To update username and number of bick for stations 
router.put("/update_stations",isLoggedIn,async (req,res)=>{
    try{
      let filter = {username:req.body.username}
      let filterd = await stations.findByUsername(filter).select({username:1,num_bick:1})
      res.status(200).json({filterd})
      
      await stations.updateOne({
        username: req.body.username
      }, {
        username: req.body.newname, 
        num_bick: req.body.num_bick
      }, {
        upsert: true
      },
      function(err, doc) {
        if (err) {
          return res.status(500).json({success:"False"});
        }
        return res.status(200).json({success:"True"});
      });
         
    }catch(err){
        res.status(500).send("Server Error")
    }
})

// Update Admin
router.put("/update_admin",isLoggedIn,async (req,res)=>{
  try{
    
    await admindb.updateOne({
      username: req.user.username
    }, {
      username: req.body.newname
    }, {
      upsert: true
    },
    function(err, doc) {
      if (err) {
        return res.status(500).json({success:"False"});
      }
      return res.status(200).json({success:"True"});
    });
       
  }catch(err){
      res.status(500).send("Server Error")
  }
})

// To create new admin
router.post("/new_Admin",async (req,res)=>{
  console.log(req.body.username, req.body.password)
   
  try{ 
   await admindb.register(
      new admindb({
         username:req.body.username,
         isAdmin:true
       }),
       req.body.password,
       function (err, user) {
         if (err) {
           console.log(err)
          //  res.redirect("/new_Admin")
           return res.status(500).send(err.message)
         } else {
           passport.authenticate("admin")(req, res, function () {
               res.send("Registored successfuly")
           });
          }
        });
  }catch(e){
       console.log("Error", e.message);
       res.status(500).send("Server Error");
  }   
});

// Redistration new station
router.post("/newstation",isLoggedIn,async (req,res)=>{
  
  try{
   await stations.register(
      new stations({
         username:req.body.username,
         num_bick:req.body.num_bick,
         station_balance_day:0,
         isAdmin:false
       }),
       req.body.password,
       function (err, user) {
         if (err) {
           return res.status(500).send(err.message)
         } else {
           passport.authenticate("station")(req, res, function () {
               res.send("Registored successfuly")
           });
          }
        });
  }catch(e){
       console.log("Error", e.message);
       res.status(500).send("Server Error");
  }   
});

router.put("/change_password_admin",isLoggedIn,async (req,res)=>{

  admindb.findByUsername(req.user.username).then(function(sanitizedUser){
    if (sanitizedUser){
        sanitizedUser.setPassword(req.body.password, function(){
            sanitizedUser.save();
            res.status(200).json({message: 'password reset successful'});
        });
    } else {
        res.status(500).json({message: 'This user does not exist'});
    }
},function(err){
    console.error(err);
})
})
// Change the password for station
router.put("/change_password_station",isLoggedIn,async (req,res)=>{

  stations.findByUsername(req.body.username).then(function(sanitizedUser){
    if (sanitizedUser){
        sanitizedUser.setPassword(req.body.password, function(){
            sanitizedUser.save();
            res.status(200).json({message: 'password reset successful'});
        });
    } else {
        res.status(500).json({message: 'This user does not exist'});
    }
},function(err){
    console.error(err);
})
})
// show all station

router.get("/all_stations",isLoggedIn,async (req,res)=>{
      let filterd = await stations.find().select({username:1,num_bick:1,station_balance_day:1})
      res.status(200).json({filterd})
 })

// total revenu generated
 router.get("/total",isLoggedIn,async (req,res)=>{
   let total=0;
      let filterd = await stations.find().select({username:1,num_bick:1,station_balance_day:1})
      filterd.forEach(val=>{ total += val.station_balance_day}) 
      
      res.status(200).json({"Total":total})
 })


// Delete station
router.delete('/delete_station', isLoggedIn,async (req, res)=>{
  await stations.deleteOne({
    username: req.body.username
  }, function(err) {
    if (err) {
      return res.status(500).json({message: 'Deletion failed',error: err.message});
    }
    return res.status(200).json({message: 'Deletion succesed'});
    
  });
});

//For Logout
router.get("/logout", (req, res) => {
  req.logout();
  res.send ("You are Loged adimin logout");
});


module.exports = router;