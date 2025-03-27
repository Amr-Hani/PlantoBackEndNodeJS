const { body } = require("express-validator");
const updateUserMiddleware = () => {
  return [
    body("firstname")
      .optional()
      .isLength({ min: 3 })
      .withMessage("First Name should be minimum 3 characters.")
      .isLength({ max: 20 })
      .withMessage("First Name should be maximum 20 characters.")
      .isAlpha()
      .withMessage("First Name shouldn't contain numbers."),

    body("lastname")
      .optional()
      .isLength({ min: 3 })
      .withMessage("Last Name should be minimum 3 characters.")
      .isLength({ max: 20 })
      .withMessage("Last Name should be maximum 20 characters.")
      .isAlpha()
      .withMessage("Last Name shouldn't contain numbers."),

    body("email").optional().isEmail().withMessage("Invalid email format."),

    body("password")
      .optional()
      .isLength({ min: 8 })
      .withMessage("Password should be at least 8 characters.")
      .isLength({ max: 20 })
      .withMessage("Password should be at most 20 characters."),

    body("phoneNumber")
      .optional()
      .isMobilePhone()
      .withMessage("Invalid phone number format."),

    body("ProfileImage")
      .optional()
      .isURL()
      .withMessage("ProfileImage should be a valid URL."),

    body("address")
      .optional()
      .isString()
      .withMessage("Address must be a valid text."),
  ];
};
module.exports = updateUserMiddleware;
