const mongoose = require("mongoose");
const validator = require("validator");
const blackListTokenSchema = mongoose.Schema({
  token: { type: String, required: true, unique: true },
  // momken a7ot expiring date bs msh ha2mel keda for nw l7ad ma at2aked mn el approch
});
module.exports = mongoose.model("BlackListToken", blackListTokenSchema);
