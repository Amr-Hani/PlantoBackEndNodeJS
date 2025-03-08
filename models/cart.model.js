const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  //what will be the cart schema

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cartItems: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1, // 3shan ay product el min bta3o ykon 1 item fel cart
      },
    },
  ],
});

module.exports = mongoose.model("Cart", CartSchema);
