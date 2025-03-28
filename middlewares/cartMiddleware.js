const { body } = require("express-validator");

// const cartMiddleware = () => {
//   return [
//     body("product_id").notEmpty().withMessage("Product ID is required"),

//     body("quantity").optional().isInt().withMessage("Minimum quantity is 1"),
//   ];
// };
const AddTocartMiddleware = () => {
  return [
    body("product_id").notEmpty().withMessage("Product ID is required"),

    body("color").notEmpty().withMessage("Color is required"),

    body("size").notEmpty().withMessage("Size is required"),

    body("quantity")
      .notEmpty()
      .withMessage("Quantitiy is required")
      .isInt({ min: 1 })
      .withMessage("Minimum quantity is 1"),
    body("priceAtPurchase")
      .notEmpty()
      .withMessage(" Price at purchase is required"),
  ];
};

const DeleteItemFromCartMiddleware = () => {
  return [
    body("product_id").notEmpty().withMessage("Product ID is required"),

    body("color").notEmpty().withMessage("Color is required"),

    body("size").notEmpty().withMessage("Size is required"),
  ];
};
module.exports = { AddTocartMiddleware, DeleteItemFromCartMiddleware };
