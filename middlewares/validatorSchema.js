const { body } = require("express-validator");

const updateUserMiddleware = () => {
  return [
    body("firstname")
      .notEmpty()
      .optional()
      .isLength({ min: 3 })
      .withMessage("First Name should be minimum 3 characters.")
      .isLength({ max: 20 })
      .withMessage("First Name should be maximum 20 characters.")
      .isAlpha()
      .withMessage("First Name shouldent containt number"),
    body("lastname")
      .notEmpty()
      .optional()
      .isLength({ min: 3 })
      .withMessage("Last Name should be minimum 3 characters.")
      .isLength({ max: 20 })
      .withMessage("Last Name and should be maximum 3 characters.")
      .isAlpha()
      .withMessage("Last Name shouldent containt number"),
    body("email")
      .notEmpty()
      .optional()
      .withMessage("email is required")
      .isEmail(),
    body("password")
      .notEmpty()
      .optional()
      .isLength({ min: 8 })
      .withMessage("password should be minimum 8 characters.")
      .isLength({ max: 20 })
      .withMessage("password should be minimum 20 characters."),
  ];
};

module.exports = updateUserMiddleware;
