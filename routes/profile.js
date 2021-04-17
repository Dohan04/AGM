const express = require("express")
const router = express.Router();
const customers = require('../models/customer')
const stationModel = require("../models/station")
const multer = require("multer")
const passport = require("passport")



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './upload')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
    
  }
})
 
var upload = multer({ storage: storage })


//For Registoring the customers
// access only for station 

router.post("/registore_customer",isLoggedInStation,upload.single('photo'),async (req,res) => {
  
  const {name,barcode,id,department}=req.body;
  var photo = req.file.filename 

   try{
     
     let customer = await customers.findOne({barcode})
     if(customer){         
         return res.status(400).json({error :[{msg:"The customer is already registored"}]});
     }

     customer = new customers({
        photo,
        name,
        id,
        barcode
     })
        
     customer.save();
    
   //  Token created
   res.status(400).send("Registsored");

   }catch(err){
           console.log(err.message);
           return res.status(500).send("Server error");
   }
      
})

// Start timer
//$$$$$$$$$$$$$$$$$$$$$4
//$$$$$$$$$$$$$$$$$$$44$
router.post("/start",isLoggedInStation,async (req,res)=>{
  try{
    var username = req.user.username;
     console.log("usernae",username)
    const {barcode} = req.body
    var filter1 = {barcode:barcode}
    var filter2 = {username:username}

    let customer = await customers.find({barcode})
    let station =  await stationModel.find({username})
    console.log(customer) 
    
    if(!customer[0]){
        return res.status(400).json({msg:"The customer is not reigstored"});
      }

   if(customer[0].current_using){
     return res.status(400).json({msg:"using"});
      }

      if(!(customer[0].creadit == 0)){
     return res.status(400).json({msg:"You have to pay the credit first",amount:customer[0].creadit});
    }
    if(!(station[0].num_bick > 0)){
     
      return res.status(400).json({msg:"The Sation currently dose not have bick"});
   }
   let time = Date.now()
   let num_of_bick = station[0].num_bick - 1
   console.log(station[0].num_bick, num_of_bick)
   const obj={
     start_time:time,
     current_using:true
    }
    
    const obj_station={
      num_bick:num_of_bick
    }
   
    let updated = await customers.findOneAndUpdate(filter1,obj, { new: true })
   
    let updatestation = await stationModel.findOneAndUpdate(filter2,obj_station, { new: true })
    
    res.json(updated)
    
    }catch(err){
      console.log(err);
      res.status(500).send("Server Error");
    }
  });

// To stop the timer
// 333333333333333333333333
//##########################

router.post("/stop",isLoggedInStation,async (req,res)=>{
    try{
      var username= req.user.username;
      const {barcode} = req.body
      var filter2 ={username:username}
      let customer = await customers.find({barcode})
      let station =  await stationModel.find({username})
      var filter1 ={barcode:barcode}
      let num_of_bick = station[0].num_bick + 1
      console.log(station[0].num_bick,num_of_bick)
      if(!customer[0]){
          return res.status(400).json({msg:"The customer is not reigstored"});
        }
   
     if(!customer[0].current_using){
       return res.status(400).json({msg:"not using"});
        }
       let time = Date.now();
       let timeused = (time - customer[0].start_time)/1000;
       let timeforcal = timeused % 60;
       if(timeforcal > 30){
         timeused = parseInt(timeused/60) +1;  
       }
       else {
         timeused = parseInt(timeused/60); 
       }
       
        let creadit = 0.5 * timeused + 1;
        let num_service = customer[0].number_services_used + 1;
        let houre = customer[0].Number_of_houres + timeused/60;
      
        const obj={
          start_time:0,
          current_using: false,
          number_services_used : num_service,
          Number_of_houres:houre
         }

         const obj_station={
          num_bick:num_of_bick
        }
    
        let updated = await customers.findOneAndUpdate(filter1,obj, { new: true })
        console.log("station id",username);
        let updatestation = await stationModel.findOneAndUpdate(filter2,obj_station, { new: true })
        
        res.json(creadit)
 
      }catch(err){
        console.log(err);
        return res.status(500).send("Server Error");
      }
    
  })
  // to senf the user state
  //////////////////////////////////////////////
  /////////////////////////////////////////////

router.post("/was_it", isLoggedInStation,async (req,res)=>{

  const {barcode} = req.body
  let customer = await customers.find({barcode})
  res.json(customer[0].current_using);
  
})  

// to pay immidately after use
//'''''''''''''''''''''''''''''''''
//'''''''''''''''''''''''''''''''''
router.post("/paid",isLoggedInStation,async (req,res)=>{
        
 try{
   var username= req.user.username;
   const {barcode,ispaid,paidAmount } = req.body
   var filter1 ={barcode:barcode}
   var filter2 = {username:username}
   let customer = await customers.find({barcode})
   var creadit_on_customer = customer[0].creadit;
   let station = await stationModel.find({username}) 
   var TotalMoney;
   var daily_money = station[0].station_balance_day;
    if(ispaid==true){
      TotalMoney = customer[0].Amount_of_money + paidAmount;
      daily_money += paidAmount;
    }
    else{
      TotalMoney = customer[0].Amount_of_money;
      creadit_on_customer += paidAmount;  
     }
   
    const obj={
      Amount_of_money:TotalMoney,
      creadit:creadit_on_customer
     }

     const obj_station = {
      station_balance_day:daily_money
     }
     
    let updated = await customers.findOneAndUpdate(filter1,obj, { new: true })
    let updatestation = await stationModel.findOneAndUpdate(filter2,obj_station, { new: true })
       
    res.json(updated)
    
  }catch(err){ 
    return res.status(500).send("Error bro");
  }
  })

// To pay unpaid or creadits 
// Fix the math for the creadit payment
 router.post("/pay_creadit",isLoggedInStation,async (req,res)=>{
  
  try{
      var username= req.user.username;
      const {barcode,paidAmount} = req.body
      let customer = await customers.find({barcode})
      var creadit_left = customer[0].creadit - paidAmount;
      let station = await stationModel.find({username}) 
      var daily_money = station[0].station_balance_day;
      var filter1 ={barcode:barcode}
      var filter2 = {username:username}
      
      
      if(!customer){
        return res.status(400).json({error :[{msg:"The customer is not reigstored"}]});
      }
      if(customer[0].creadit == 0){
        return res.status(400).json({error :[{msg:"The customer creadit is 0"}]});
      }
     
      if(creadit_left < 0 || creadit_left == 0){
        creadit_left = 0;
        daily_money += customer[0].creadit;
      }
      if(customer[0].creadit > paidAmount )
       {
        daily_money += paidAmount;
       }
      let TotalMoney = customer[0].Amount_of_money + paidAmount;
      const obj={
        Amount_of_money:TotalMoney,
        creadit:creadit_left
       }
       const obj_station = {
        station_balance_day:daily_money
       }
       
       let updated = await customers.findOneAndUpdate(filter1,obj, { new: true })
       let updatestation = await stationModel.findOneAndUpdate(filter2,obj_station, { new: true })       
      res.json(updated)
    }catch(err){
      return res.status(500).send("Error bro", err.message );
    }
 })
// submiting the daly money made
// ////////////////////////////
/////////////////////////////////////
//  router.post("/submit", is,async (req,res)=>{
  
//   const username = req.user.username
//   let new_station = await stationModel.findOne({username})

//   new_station[0].station_balance_day
//   // let admin = admindb[0]
    
//  })

// Login Middleware 
function isLoggedInStation(req, res, next) {
  
  if (req.isAuthenticated()) {

    if(!(req.user.isAdmin))
      return next();
  }
  res.send("Not Authorized")
  // res.redirect("/login");
}


router.get("/station", (req,res)=>{
  res.json({status:"succesful"});
})
router.get("/login", (req,res)=>{
  res.json({status:"Invalid credentials"});
})


router.post(
  "/login_stations",
  passport.authenticate("station", {
    successRedirect: "/station/station",
    failureRedirect: "/station/login",
  }),
  function (req, res) {
    console.log(req.user)
  }
);



 
//For Logout
router.get("/logout", (req, res) => {
  req.logout();
  res.json("You are Loged Out bro");
});

// For wrong route requestes  
router.all("*",(req,res)=>{
res.send("404 Not Found")
})

 module.exports = router;
