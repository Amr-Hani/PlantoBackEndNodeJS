const { body } = require("express-validator");

const validateProductMiddleware = () => {
  return [
    body("title")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title should be between 3 and 100 characters."),

    body("description")
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Description should be between 10 and 500 characters."),

    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    body("rating")
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),

    body("productCode")
      .trim()
      .isString()
      .withMessage("Product Code must be a string."),

    body("shippingTax")
      .isFloat({ min: 0 })
      .withMessage("Shipping tax must be a positive number."),

    body("availableColorsAndSizes")
      .notEmpty()
      .withMessage(" stocj is required!!")
      .isArray()
      .withMessage("Available colors and sizes must be an array."),

    body("availableColorsAndSizes.*.color")
      .notEmpty()
      .withMessage(" color is required!!")
      .isIn(["Black", "White", "Blue", "Red"])
      .withMessage("Color must be one of: Black, White, Blue, Red."),

    body("availableColorsAndSizes.*.sizes")
      .isArray()
      .withMessage("Sizes must be an array."),

    body("availableColorsAndSizes.*.sizes.*.size")
      .isIn(["S", "M", "L", "XL", "XXL"])
      .withMessage("Size must be one of: S, M, L, XL, XXL."),

    body("availableColorsAndSizes.*.sizes.*.quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer."),

    body("categories")
      .trim()
      .isString()
      .withMessage("Categories must be a string."),

    body("tags").trim().isString().withMessage("Tags must be a string."),

    body("brand").trim().isString().withMessage("Brand must be a string."),

    body("sale")
      .isFloat({ min: 0, max: 1 })
      .withMessage("Sale must be between 0 and 1."),

    body("hot").isBoolean().withMessage("Hot must be a boolean value."),

    body("image").trim().isString().withMessage("Image must be a string."),
  ];
};

//module.exports = validateProductMiddleware;
module.exports = { validateProductMiddleware };
