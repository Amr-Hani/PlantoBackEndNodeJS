const { body } = require("express-validator");

const cartMiddleware = () => {
  return [
    body("product_id").notEmpty().withMessage("Product ID is required"),

    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Minimum quantity is 1"),
  ];
};

module.exports = cartMiddleware;
