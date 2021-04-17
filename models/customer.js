const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  photo:{
       type:String,
       required:true,
  },
  name:{
      type:String,
      required:true,
      },
  id:{
      type:String,
      required: true,
      unique: true
   },
  barcode:{
    type:String,
    required:true,
    unique: true
  },
  customer_type:{
        type:String,
        default:"Regular"
    },
   rate:{
        type:Number,
        default:0.5
    },
    number_services_used:{
        type:Number,
        default:0
    },
    Number_of_houres:{
        type:Number,
        default:0
    },
    Amount_of_money:{
        type:Number,
        default:0
    },
    start_time:{
        type:Number,
        default:0
    },
    current_using:{
        type:Boolean,
        default:false
    },
    creadit:{
        type:Number,
        default:0
    }
})

module.exports = customer = mongoose.model("customer", customerSchema);
