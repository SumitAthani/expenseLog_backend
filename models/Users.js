const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    maxlength: 225,
    required: true,
  },
  email: {
    type: String,
    maxlength: 255,
    required: true,
    unique: true,
    match:
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
  },
  password: {
    type: String,
    minlength: 8,
    required: true,
  },
  all: {
    type: Object,
    required: false, 
    default: {}
  },

  token:{
    type: Array, 
    default: []
  }
    // yearMonthMap:{
    //     type: Map,
    //     required: false,
        
    // }
});


module.exports = mongoose.model("Users", UserSchema);