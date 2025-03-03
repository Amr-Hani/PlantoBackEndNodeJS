// product = {
//   title: "Wireless Bluetooth Headphones",
//   description:
//     "High-quality over-ear wireless headphones with noise cancellation and long battery life.",
//   price: 79.99, // Price in dollars
//   rating: 3, // Rating from 1 to 5
//   quantity: 100, //vailable stock quantity
//   productCode: "WBH-2024", // Unique product code
//   shippingTax: 5.99, // Shipping tax in dollars
//   availableColors: ["Black", "White", "Blue", "Red"], // Array of available colors
//   availableSizes: ["S", "M", "L"], // Array of available sizes
//   imageSrc: "./Assets/product.jpg",
//   categories: "Butter & Eggs, Fruits, Milk & Cream, Vegetables",
//   tags: "organic food, fruits, juice",
//   brand: " KFC",
//   sale:0.2,
//   hot: true,
// };

const mongoose = require("mongoose");
const validator = require("validator");

const productSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  productCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  shippingTax: {
    type: Number,
    required: true,
    min: 0,
  },
  availableColors: {
    type: [String],
    required: true,
    enum: ["Black", "White", "Blue", "Red"],
    validate: {
      validator: (arr) =>
        arr.every((color) => ["Black", "White", "Blue", "Red"].includes(color)),
      message: "Color must be one of: Black, White, Blue, Red",
    },
  },
  availableSizes: {
    type: [String],
    required: true,
    enum: ["S", "M", "L", "XL", "XXL"],
    validate: {
      validator: (arr) =>
        arr.every((size) => ["S", "M", "L", "XL", "XXL"].includes(size)),
      message: "Size must be one of: S, M, L, XL, XXL",
    },
  },
  imageSrc: {
    type: String,
    required: true,
    trim: true,
  },
  categories: {
    type: String,
    required: true,
    trim: true,
  },
  tags: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  sale: {
    type: Number,
    required: true,
    min: 0,
    max: 1, // 0 to 1 representing percentage (e.g., 0.2 means 20%)
  },
  hot: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
