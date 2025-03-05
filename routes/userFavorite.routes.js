const express = require("express");
const router = express.Router();
const {
  addFavoriteProduct,
} = require("../controllers/userFavorite.controller");

router.route("/").post(addFavoriteProduct);
module.exports = router;
