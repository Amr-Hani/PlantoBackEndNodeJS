const aysncWrapper = require("../middlewares/errorHandler.js");
const status = require("../utils/httpStatusText.js");
const Users = require("../models/user.model.js");
const AppError = require("../utils/appErrors.js");
const bcrypt = require("bcryptjs");
const generateJWT = require("../utils/generateJWT.js");
const { validationResult } = require("express-validator");

const getAllUsers = aysncWrapper(async (req, res) => {
  const users = await Users.find({}, { token: 0, __v: 0, password: 0 });
  res.json({ status: status.SUCCESS, data: { users } });
});

const register = aysncWrapper(async (req, res, next) => {
  const { firstname, lastname, email, password } = req.body;
  const newUser = await Users.findOne({ email: email });
  if (newUser) {
    const error = AppError.createError(
      "User already exists",
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const allowedFields = [
    "firstname",
    "lastname",
    "email",
    "password",
    "phoneNumber",
    "ProfileImage",
    "address",
  ];
  const requestFields = Object.keys(req.body);
  const invalidFields = requestFields.filter(
    (field) => !allowedFields.includes(field)
  );
  if (invalidFields.length > 0) {
    const error = AppError.createError(
      `Invalid fields: ${invalidFields.join(
        ", "
      )}. Allowed fields: ${allowedFields.join(", ")}`,
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
  const user = new Users({
    firstname,
    lastname,
    email,
    password: hashedPassword,
  });
  const token = await generateJWT(user);

  user.token = token;
  await user.save();
  res.status(201).json({ status: status.CREATED, data: user });
});

const login = aysncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = AppError.createError(
      "Please provide email and password",
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
  const user = await Users.findOne({ email: email }, { __v: false });
  if (!user) {
    const error = AppError.createError("User not found", 404, status.NOT_FOUND);
    return next(error);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = AppError.createError(
      "Invalid credentials",
      401,
      status.UNAUTHORIZED
    );
    return next(error);
  }
  const token = await generateJWT(user);
  res.json({ status: status.SUCCESS, data: { token } });
});

const update = aysncWrapper(async (req, res, next) => {
  const {
    firstname,
    lastname,
    email,
    password,
    phoneNumber,
    ProfileImage,
    address,
  } = req.body;
  // Check if request body is empty
  if (
    !firstname &&
    !lastname &&
    !email &&
    !password
    /**&& 
     *  !phoneNumber &&
    !ProfileImage &&
    !address */
  ) {
    const error = AppError.createError(
      "Please provide at least one valid field to update",
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
  // Define allowed fields based on your User model
  const allowedFields = [
    "firstname",
    "lastname",
    "email",
    "password",
    "phoneNumber",
    "ProfileImage",
    "address",
  ];
  // Extract fields from req.body
  const requestFields = Object.keys(req.body);
  // Find invalid fields
  const invalidFields = requestFields.filter(
    (field) => !allowedFields.includes(field)
  );
  // If there are invalid fields, return an error response
  if (invalidFields.length > 0) {
    const error = AppError.createError(
      `Invalid fields: ${invalidFields.join(
        ", "
      )}. Allowed fields: ${allowedFields.join(", ")}`,
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
  console.log("req.body", req.body);
  // Find and update the user
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = AppError.createError(errors.array(), 400, status.BAD_REQUEST);
    return next(error);
  }
  var user = await Users.findOne({ email: req.params.email });
  if (!user) {
    const error = AppError.createError("User not found", 404, status.NOT_FOUND);
    return next(error);
  }
  let hashedPassword;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;
  }
  const newUser = await Users.findOneAndUpdate(
    { email: req.params.email },
    { $set: req.body },
    { new: true } // Return updated document
  );
  if (!newUser) {
    const error = AppError.createError("User not found", 404, status.NOT_FOUND);
    return next(error);
  }
  res.json({ status: status.SUCCESS, data: { newUser } });
});

///////////////////////////////////////////////////////////////////////////////////////
const jwt = require("jsonwebtoken");
const getUserIdFromToken = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    console.log(req.headers.authorization);
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return decoded.id; // Ensure JWT contains { userId: "..." }  ezay a3raf aeh elli mwgod hena
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
const getUserByToken = aysncWrapper(async (req, res) => {
  const userId = getUserIdFromToken(req);
  console.log(req.headers.authorization);
  console.log(userId);

  const user = await Users.find(
    { _id: userId },
    { token: 0, __v: 0, password: 0 }
  );
  res.json({ status: status.SUCCESS, data: user[0] });
});

const updateByToken = aysncWrapper(async (req, res, next) => {
  const userId = getUserIdFromToken(req);
  console.log(userId);
  console.log(req.body);
  console.log(req.body.ProfileImage);

  const {
    firstname,
    lastname,
    email,
    password,
    phoneNumber,
    ProfileImage,
    address,
  } = req.body;
  // Check if request body is empty
  if (
    !firstname &&
    !lastname &&
    !email &&
    !password &&
    !phoneNumber &&
    !ProfileImage &&
    !address
  ) {
    const error = AppError.createError(
      "Please provide at least one valid field to update",
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
  // Define allowed fields based on your User model
  const allowedFields = [
    "firstname",
    "lastname",
    "email",
    "password",
    "phoneNumber",
    "ProfileImage",
    "address",
  ];
  // Extract fields from req.body
  const requestFields = Object.keys(req.body);
  // Find invalid fields
  const invalidFields = requestFields.filter(
    (field) => !allowedFields.includes(field)
  );
  // If there are invalid fields, return an error response
  if (invalidFields.length > 0) {
    const error = AppError.createError(
      `Invalid fields: ${invalidFields.join(
        ", "
      )}. Allowed fields: ${allowedFields.join(", ")}`,
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
  console.log("req.body", req.body);
  // Find and update the user
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = AppError.createError(errors.array(), 400, status.BAD_REQUEST);
    return next(error);
  }
  var user1 = await Users.findOne({ _id: userId });
  if (!user1) {
    const error = AppError.createError("User not found", 404, status.NOT_FOUND);
    return next(error);
  }
  var user2 = await Users.findOne({ email: req.body.email });
  if (user2) {
    const error = AppError.createError(
      "this User is Exists",
      404,
      status.NOT_FOUND
    );
    return next(error);
  }

  let hashedPassword;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;
  }
  const newUser = await Users.findOneAndUpdate(
    { email: user1.email },
    { $set: req.body },
    { new: true } // Return updated document
  );
  if (!newUser) {
    const error = AppError.createError("User not found", 404, status.NOT_FOUND);
    return next(error);
  }
  res.json({ status: status.SUCCESS, data: newUser });
});

///////////////////////////////////////////////////////////////////////////////////////

module.exports = {
  getAllUsers,
  register,
  login,
  update,
  getUserByToken,
  updateByToken,
};
