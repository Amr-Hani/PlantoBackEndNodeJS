const mongoose = require("mongoose");
const validator = require("validator");
const userSchema = mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "Invalid Email",
    },
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },

  address: {
    type: String,
    // required: true, // han3os ndifha sa3et lma el user ytlop 7aga men elcart
  },
  phoneNumber: {
    type: String,
    // required: true, // han3os ndifha sa3et lma el user ytlop 7aga men elcart
    validate: {
      validator: validator.isMobilePhone,
      message: "Invalid phone number",
    },
  },
});
module.exports = mongoose.model("User", userSchema);
