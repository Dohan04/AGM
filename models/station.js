const mongoose = require('mongoose');
const passport = require("passport-local-mongoose")
const StationSchema = new mongoose.Schema({
  username:String,
  password:String,
  num_bick:Number,
  station_balance_day:Number,
  isAdmin:Boolean

})
StationSchema.plugin(passport)
module.exports = station = mongoose.model("station", StationSchema);