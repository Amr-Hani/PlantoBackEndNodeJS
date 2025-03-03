const express = require("express");
const router = express.Router();
// const validatorSchema = require("../middlewares/validatorSchema.js");

const userController = require("../controllers/users.controller.js");
const verifyToken = require("../middlewares/verifyToken.js");
const updateUserMiddleware = require("../middlewares/validatorSchema.js");

/**
 * get all users
 *
 * regester
 *
 * login
 *
 */

router.route("/").get(/**verifyToken, */ userController.getAllUsers);

router.route("/register").post(userController.register);

router.route("/login").post(userController.login);

router.route("/:email").patch(updateUserMiddleware(), userController.update);

module.exports = router;
