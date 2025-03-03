const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller.js");

router.route("/").get(productController.getAllProduct);
router.route("/").post(productController.addProduct);

module.exports = router;
