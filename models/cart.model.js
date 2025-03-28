const mongoose = require("mongoose");

// const CartSchema = new mongoose.Schema({
//   //what will be the cart schema

//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   cartItems: [
//     {
//       product_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Product",
//         required: true,
//       },
//       quantity: {
//         type: Number,
//         required: true,
//         min: 1, // 3shan ay product el min bta3o ykon 1 item fel cart
//       },
//     },
//   ],
// });

const CartSchema2 = new mongoose.Schema({
  //what will be the cart schema

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cartItems: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      color: {
        type: String,
        required: true,
        enum: ["Black", "White", "Blue", "Red"],
      },
      size: {
        type: String,
        required: true,
        enum: ["S", "M", "L", "XL", "XXL"],
      },
      quantity: {
        type: Number,
        required: true,
        min: 1, // 3shan ay product el min bta3o ykon 1 item fel cart
      },
      priceAtPurchase: {
        type: Number,
        required: true,
        min: 0, // 3shan myb3atsh 7aga b minus -_-
      },
    },
  ],
});

module.exports = mongoose.model("Cart", CartSchema2);
