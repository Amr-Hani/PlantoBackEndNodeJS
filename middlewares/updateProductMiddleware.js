// const { body } = require("express-validator");

// const updateProductMiddleware = () => {
//   return [
//     body("title")
//       .optional()
//       .trim()
//       .isLength({ min: 3, max: 100 })
//       .withMessage("Title should be between 3 and 100 characters."),

//     body("description")
//       .optional()
//       .trim()
//       .isLength({ min: 10, max: 500 })
//       .withMessage("Description should be between 10 and 500 characters."),

//     body("price")
//       .optional()
//       .isFloat({ min: 0 })
//       .withMessage("Price must be a positive number."),

//     body("rating")
//       .optional()
//       .isFloat({ min: 1, max: 5 })
//       .withMessage("Rating must be between 1 and 5."),

//     body("quantity")
//       .optional()
//       .isInt({ min: 0 })
//       .withMessage("Quantity must be a positive integer."),

//     body("productCode")
//       .optional()
//       .trim()
//       .isString()
//       .withMessage("Product Code must be a string."),

//     body("shippingTax")
//       .optional()
//       .isFloat({ min: 0 })
//       .withMessage("Shipping tax must be a positive number."),

//     body("availableColors")
//       .optional()
//       .isArray()
//       .withMessage("Available colors must be an array.")
//       .custom((arr) =>
//         arr.every((color) => ["Black", "White", "Blue", "Red"].includes(color))
//       )
//       .withMessage("Color must be one of: Black, White, Blue, Red."),

//     body("availableSizes")
//       .optional()
//       .isArray()
//       .withMessage("Available sizes must be an array.")
//       .custom((arr) =>
//         arr.every((size) => ["S", "M", "L", "XL", "XXL"].includes(size))
//       )
//       .withMessage("Size must be one of: S, M, L, XL, XXL."),

//     body("categories")
//       .optional()
//       .trim()
//       .isString()
//       .withMessage("Categories must be a string."),

//     body("tags")
//       .optional()
//       .trim()
//       .isString()
//       .withMessage("Tags must be a string."),

//     body("brand")
//       .optional()
//       .trim()
//       .isString()
//       .withMessage("Brand must be a string."),

//     body("sale")
//       .optional()
//       .isFloat({ min: 0, max: 1 })
//       .withMessage("Sale must be between 0 and 1."),

//     body("hot")
//       .optional()
//       .isBoolean()
//       .withMessage("Hot must be a boolean value."),

//     body("image")
//       .optional()
//       .trim()
//       .isString()
//       .withMessage("Image must be a string."),
//   ];
// };

// module.exports = updateProductMiddleware;

const { body } = require("express-validator");

const updateProductMiddleware = () => {
  return [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title should be between 3 and 100 characters."),

    body("description")
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Description should be between 10 and 500 characters."),

    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    body("rating")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),

    body("productCode")
      .optional()
      .trim()
      .isString()
      .withMessage("Product Code must be a string."),

    body("shippingTax")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Shipping tax must be a positive number."),

    body("stock")
      .optional()
      .isArray({ min: 1 })
      .withMessage("Stock must be a non-empty array.")
      .custom((stockArr) => {
        const validColors = ["Black", "White", "Blue", "Red"];
        const validSizes = ["S", "M", "L", "XL", "XXL"];
        for (const item of stockArr) {
          if (
            !item.color ||
            !validColors.includes(item.color) ||
            !Array.isArray(item.sizes)
          ) {
            return false;
          }
          for (const sizeObj of item.sizes) {
            if (
              !sizeObj.size ||
              !validSizes.includes(sizeObj.size) ||
              typeof sizeObj.quantity !== "number" ||
              sizeObj.quantity < 0
            ) {
              return false;
            }
          }
        }
        return true;
      })
      .withMessage(
        "Each stock item must have a valid color and an array of valid sizes with positive quantity."
      ),

    body("categories")
      .optional()
      .trim()
      .isString()
      .withMessage("Categories must be a string."),

    body("tags")
      .optional()
      .trim()
      .isString()
      .withMessage("Tags must be a string."),

    body("brand")
      .optional()
      .trim()
      .isString()
      .withMessage("Brand must be a string."),

    body("sale")
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage("Sale must be between 0 and 1."),

    body("hot")
      .optional()
      .isBoolean()
      .withMessage("Hot must be a boolean value."),

    body("image")
      .optional()
      .trim()
      .isString()

      .withMessage("Image must be a string."),
  ];
};

module.exports = updateProductMiddleware;
