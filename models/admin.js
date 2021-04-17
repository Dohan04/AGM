const mongoose = require('mongoose');
const passport = require("passport-local-mongoose")
const AdminSchema = new mongoose.Schema({
  username:String,
  password:String,
  total_money:Number,
  isAdmin:Boolean
})
AdminSchema.plugin(passport)
module.exports = Admin = mongoose.model("Admin", AdminSchema);