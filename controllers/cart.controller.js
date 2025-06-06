const aysncWrapper = require("../middlewares/errorHandler.js");
const status = require("../utils/httpStatusText.js");
const AppError = require("../utils/appErrors.js");
const bcrypt = require("bcryptjs");
const UserFavorites = require("../models/userFavorites.model");
const jwt = require("jsonwebtoken");
const Product = require("../models/product.model.js");
const Cart = require("../models/cart.model.js");
const Stripe = require("stripe")(process.env.STRIPE_SECERT_KEY);
const { validationResult } = require("express-validator");

//===============decode token to get user Id =====================
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

//======================add Product to cart===========================================

const addItemToCart = aysncWrapper(async (req, res, next) => {
  const userId = getUserIdFromToken(req);
  //const product_id = req.body.product_id; // sami dol tani da test bardo
  // const quantity = req.body.quantity || 1;
  const requestFields = Object.keys(req.body);
  const allowedFields = [
    "product_id",
    "quantity",
    "size",
    "color",
    "priceAtPurchase",
  ];
  const { product_id, quantity = 1, color, size, priceAtPurchase } = req.body;
  const invalidFields = requestFields.filter(
    (field) => !allowedFields.includes(field)
  );
  if (requestFields.length === 0) {
    const error = AppError.createError(
      "Please provide at least one valid field to update",
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }

  if (invalidFields.length > 0) {
    const error = AppError.createError(
      `Invalid fields:( ${invalidFields.join(
        ", "
      )} ) Allowed fields: (${allowedFields.join(", ")})`,
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = AppError.createError(errors.array(), 400, status.BAD_REQUEST);
    return next(error);
  }

  if (!userId) {
    const error = AppError.createError(
      "Unauthorized",
      401,
      status.UNAUTHORIZED
    );
    return next(error);
  }

  // now check if ther is a product with this id or not
  let product = await Product.findOne({ _id: product_id });
  console.log(product);

  if (!product) {
    const error = AppError.createError(
      "no prodouct with this id",
      404,
      status.NOT_FOUND
    );
    return next(error);
  }
  // now check if their a product with the selected color not the stock or not
  const stockItemWithSepecific_Color = product.stock.find(
    (item) => item.color === color
  );
  if (!stockItemWithSepecific_Color) {
    return next(
      AppError.createError(
        "Invalid color for this product",
        400,
        status.BAD_REQUEST
      )
    );
  }
  console.log(stockItemWithSepecific_Color);
  // now check on the stockItemWithSepecific_Color if it have a size like the requested
  const stockItemWithSepecific_ColorAndSize =
    stockItemWithSepecific_Color.sizes.find((s) => s.size === size);
  if (!stockItemWithSepecific_ColorAndSize) {
    return next(
      AppError.createError(
        "Invalid size for this product",
        400,
        status.BAD_REQUEST
      )
    );
  }
  console.log(stockItemWithSepecific_ColorAndSize);
  // now check on the quantitiy >> el ckeck da 3shan a2amen nafsy mel front
  if (quantity > stockItemWithSepecific_ColorAndSize.quantity) {
    return next(
      AppError.createError(
        `Requested quantity A exceeds available stock and the stock limit is ${
          stockItemWithSepecific_ColorAndSize.quantity
        } and you tried to order ${existingItem.quantity + quantity}`,
        400,
        status.BAD_REQUEST
      )
    );
  }
  // kda 5allat el checks >> e3ml cart b2a aw def 3al existing
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    // kda ha3ml cart gdeda w hadef el product bel quantity elli mb3ota
    cart = new Cart({
      userId,
      cartItems: [{ product_id, quantity, color, size, priceAtPurchase }],
    });
  } else {
    // hashof el item da fel cart abl kda walla la2
    const existingItem = cart.cartItems.find(
      (item) =>
        item.product_id.equals(product_id) &&
        item.color === color &&
        item.size === size
    );

    if (existingItem) {
      // existingItem.quantity = quantity; // hb3at mn el Total quantity
      //**************************da check 3shan lw el previous added to cart ******************************************* */
      // if (existingItem) {
      //   if (existingItem.quantity == 0)
      //   {

      //     existingItem.quantity = quantity; // hb3at mn el Total quantity
      //   }
      //   else
      //   {
      //     existingItem.quantity += quantity; // hb3at mn el Total quantity

      //   }

      // check if the requested qyantity + existing quantitiy in the cart > the stock quantity
      if (
        existingItem.quantity + quantity >
        stockItemWithSepecific_ColorAndSize.quantity
      ) {
        return next(
          AppError.createError(
            `Requested quantity B exceeds available stock and the stock limit is ${
              stockItemWithSepecific_ColorAndSize.quantity
            } and you tried to order ${existingItem.quantity + quantity}`,
            400,
            status.BAD_REQUEST
          )
        );
      } else {
        existingItem.quantity += quantity;
        existingItem.priceAtPurchase += priceAtPurchase;
      }

      //********************************************************************* */
    } else {
      // case en el item msh mwgod fel cart >> ezan hadefo bel quantity elli gaya 3shan hwa keda gay mn el single product
      cart.cartItems.push({
        product_id,
        quantity,
        color,
        size,
        priceAtPurchase,
      }); // Add new product
    }
  }

  await cart.save();
  res.json({ message: "Cart updated successfully", data: cart });
});
//======================Update Item Quantitiy from==============================================================
const updateItemQuantityFromCart = aysncWrapper(async (req, res, next) => {
  const userId = getUserIdFromToken(req);
  //const product_id = req.body.product_id; // sami dol tani da test bardo
  // const quantity = req.body.quantity || 1;
  const requestFields = Object.keys(req.body);
  const allowedFields = [
    "product_id",
    "quantity",
    "size",
    "color",
    "priceAtPurchase",
  ];
  const { product_id, quantity = 1, color, size, priceAtPurchase } = req.body;
  const invalidFields = requestFields.filter(
    (field) => !allowedFields.includes(field)
  );
  if (requestFields.length === 0) {
    const error = AppError.createError(
      "Please provide at least one valid field to update",
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }

  if (invalidFields.length > 0) {
    const error = AppError.createError(
      `Invalid fields:( ${invalidFields.join(
        ", "
      )} ) Allowed fields: (${allowedFields.join(", ")})`,
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = AppError.createError(errors.array(), 400, status.BAD_REQUEST);
    return next(error);
  }

  if (!userId) {
    const error = AppError.createError(
      "Unauthorized",
      401,
      status.UNAUTHORIZED
    );
    return next(error);
  }

  // now check if ther is a product with this id or not
  let product = await Product.findOne({ _id: product_id });
  console.log(product);

  if (!product) {
    const error = AppError.createError(
      "no prodouct with this id",
      404,
      status.NOT_FOUND
    );
    return next(error);
  }
  // now check if their a product with the selected color not the stock or not
  const stockItemWithSepecific_Color = product.stock.find(
    (item) => item.color === color
  );
  if (!stockItemWithSepecific_Color) {
    return next(
      AppError.createError(
        "Invalid color for this product",
        400,
        status.BAD_REQUEST
      )
    );
  }
  console.log(stockItemWithSepecific_Color);
  // now check on the stockItemWithSepecific_Color if it have a size like the requested
  const stockItemWithSepecific_ColorAndSize =
    stockItemWithSepecific_Color.sizes.find((s) => s.size === size);
  if (!stockItemWithSepecific_ColorAndSize) {
    return next(
      AppError.createError(
        "Invalid size for this product",
        400,
        status.BAD_REQUEST
      )
    );
  }
  console.log({ stockItemWithSepecific_ColorAndSize });
  // now check on the quantitiy >> el ckeck da 3shan a2amen nafsy mel front

  // kda 5allat el checks >> e3ml cart b2a aw def 3al existing
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    // kda ha3ml cart gdeda w hadef el product bel quantity elli mb3ota
    cart = new Cart({
      userId,
      cartItems: [{ product_id, quantity, color, size, priceAtPurchase }],
    });
  } else {
    // hashof el item da fel cart abl kda walla la2
    const existingItem = cart.cartItems.find(
      (item) =>
        item.product_id.equals(product_id) &&
        item.color === color &&
        item.size === size
    );
    if (quantity > stockItemWithSepecific_ColorAndSize.quantity) {
      return next(
        AppError.createError(
          `Requested quantity exceeds available stock and the stock limit is ${stockItemWithSepecific_ColorAndSize.quantity} and you tried to order ${quantity}`,
          400,
          status.BAD_REQUEST
        )
      );
    }

    console.log({ existingItem });

    if (existingItem) {
      // bma enni hb3at mn el c art nafs-aah el new requested quantity . ezan ha3mel override 3shana ana 3amel already check fo2 by2olli eza kan 3adda el
      // available quantitiy of same size and color in stock walla la2
      existingItem.quantity = quantity; // hb3at mn el Total quantity
      existingItem.priceAtPurchase = priceAtPurchase; // update price at purchase
    } else {
      // case en el item msh mwgod fel cart >> ezan hadefo bel quantity elli gaya 3shan hwa keda gay mn el single product
      cart.cartItems.push({
        product_id,
        quantity,
        color,
        size,
        priceAtPurchase,
      }); // Add new product
    }
  }

  await cart.save();
  res.json({ message: "Cart updated successfully", data: cart });
});

//======================Get cart By Id================================================

const getCartById = aysncWrapper(async (req, res, next) => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    const error = AppError.createError(
      "Unauthorized",
      401,
      status.UNAUTHORIZED
    );
    return next(error);
  }

  const cart = await Cart.findOne({ userId }).populate("cartItems.product_id");
  if (cart.cartItems.length == 0) {
    return res
      .status(200)
      .json({ message: "Cart is Empty", data: cart.cartItems });
  }

  res.json(cart);
});

//======================Delete Item Fom Cart==========================================
// ------------------V1--------------------------------
/*const deleteItemFromCart = aysncWrapper(async (req, res, next) => {
  const userId = getUserIdFromToken(req);
  const requestFields = Object.keys(req.body);
  const allowedFields = ["product_id", "size", "color"];
  const { product_id, color, size } = req.body;
  // now start chechikg on the request fields
  const invalidFields = requestFields.filter(
    (field) => !allowedFields.includes(field)
  );
  if (requestFields.length === 0) {
    const error = AppError.createError(
      "Please provide at least one valid field to update",
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }

  if (invalidFields.length > 0) {
    const error = AppError.createError(
      `Invalid fields:( ${invalidFields.join(
        ", "
      )} ) Allowed fields: (${allowedFields.join(", ")})`,
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = AppError.createError(errors.array(), 400, status.BAD_REQUEST);
    return next(error);
  }

  if (!userId) {
    const error = AppError.createError(
      "Unauthorized",
      401,
      status.UNAUTHORIZED
    );
    return next(error);
  }
  // now i have finished cart checking >> lets do the cart checking
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    const error = AppError.createError("Cart Not Found", 404, status.NOT_FOUND);
    return next(error);
  }
  const existingItem = cart.cartItems.find(
    (item) =>
      item.product_id.equals(product_id) &&
      item.color === color &&
      item.size === size
  );

  // case en el element da (bel id wel size wel color) msh mwgod fel Cart
  if (!existingItem) {
    return next(
      AppError.createError("Item isn't found in cart", 404, status.NOT_FOUND)
    );
  }
  // case en el element da mwgod fe3lan .. hmsa7o b2a
  cart.cartItems = cart.cartItems.filter(
    (item) =>
      !(
        item.product_id.equals(product_id) &&
        item.color === color &&
        item.size === size
      ) // leh 3mlt keda .. 3shan lw 3ndi 2 item b nafs el id bs different size and color
  );

  await cart.save();
  res.json({ message: "Product removed from cart", cart });
}); */

//-------------------v2--------------------------------

const deleteItemFromCart = aysncWrapper(async (req, res, next) => {
  const userId = getUserIdFromToken(req);
  const { product_id } = req.params;
  const { size, color } = req.query;
  // check if the user is authrized or not
  if (!userId) {
    const error = AppError.createError(
      "Unauthorized",
      401,
      status.UNAUTHORIZED
    );
    return next(error);
  }
  if (!product_id) {
    return next(
      AppError.createError(
        "product_id is required parameters",
        400,
        status.BAD_REQUEST
      )
    );
  }
  if (!color) {
    return next(
      AppError.createError(
        "color is required parameters",
        400,
        status.BAD_REQUEST
      )
    );
  }
  if (!size) {
    return next(
      AppError.createError(
        "size is required parameters",
        400,
        status.BAD_REQUEST
      )
    );
  }
  // now i have finished cart checking >> lets do the cart checking
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    const error = AppError.createError("Cart Not Found", 404, status.NOT_FOUND);
    return next(error);
  }
  const existingItem = cart.cartItems.find(
    (item) =>
      item.product_id.equals(product_id) &&
      item.color === color &&
      item.size === size
  );

  // case en el element da (bel id wel size wel color) msh mwgod fel Cart
  if (!existingItem) {
    return next(
      AppError.createError("Item isn't found in cart", 404, status.NOT_FOUND)
    );
  }
  // case en el element da mwgod fe3lan .. hmsa7o b2a
  cart.cartItems = cart.cartItems.filter(
    (item) =>
      !(
        item.product_id.equals(product_id) &&
        item.color === color &&
        item.size === size
      ) // leh 3mlt keda .. 3shan lw 3ndi 2 item b nafs el id bs different size and color
  );

  await cart.save();
  res.json({ message: "Product removed from cart", cart });
});

//======================Update Cart===================================================

const updateCart = aysncWrapper(async (req, res, next) => {
  const userId = getUserIdFromToken(req);
  const requestFields = Object.keys(req.body);
  const allowedFields = [
    "product_id",
    "quantity",
    "size",
    "color",
    "priceAtPurchase",
    "cartItem_id",
  ];
  const {
    product_id,
    quantity = 1,
    color,
    size,
    priceAtPurchase,
    cartItem_id,
  } = req.body;
  // now lets start the fileds checking
  const invalidFields = requestFields.filter(
    (field) => !allowedFields.includes(field)
  );
  if (requestFields.length === 0) {
    const error = AppError.createError(
      "Please provide at least one valid field to update",
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }

  if (invalidFields.length > 0) {
    const error = AppError.createError(
      `Invalid fields:( ${invalidFields.join(
        ", "
      )} ) Allowed fields: (${allowedFields.join(", ")})`,
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = AppError.createError(errors.array(), 400, status.BAD_REQUEST);
    return next(error);
  }

  if (!userId) {
    const error = AppError.createError(
      "Unauthorized",
      401,
      status.UNAUTHORIZED
    );
    return next(error);
  }
  // now lets start the values checking
  //---------------------------------------------------------------//
  // now check if ther is a product with this id or not
  let product = await Product.findOne({ _id: product_id });
  console.log(product);

  if (!product) {
    const error = AppError.createError(
      "no prodouct with this id",
      404,
      status.NOT_FOUND
    );
    return next(error);
  }
  // now check if their a product with the selected color not the stock or not
  const stockItemWithSepecific_Color = product.stock.find(
    (item) => item.color === color
  );
  if (!stockItemWithSepecific_Color) {
    return next(
      AppError.createError(
        "Invalid color for this product",
        400,
        status.BAD_REQUEST
      )
    );
  }
  console.log(stockItemWithSepecific_Color);
  // now check on the stockItemWithSepecific_Color if it have a size like the requested
  const stockItemWithSepecific_ColorAndSize =
    stockItemWithSepecific_Color.sizes.find((s) => s.size === size);
  if (!stockItemWithSepecific_ColorAndSize) {
    return next(
      AppError.createError(
        "Invalid size for this product",
        400,
        status.BAD_REQUEST
      )
    );
  }
  console.log(stockItemWithSepecific_ColorAndSize);
  // now check on the quantitiy
  if (quantity > stockItemWithSepecific_ColorAndSize.quantity) {
    return next(
      AppError.createError(
        "Requested quantity exceeds available stock",
        400,
        status.BAD_REQUEST
      )
    );
  }
  // kda kol el values tmam w a2dar 3adel beha el product da .. dlwa2ty ro7 hato mn el cart bs el awel hat el cart
  // bs 3ndi moshkela >> efred en 3ndi etnen object b nafs el id fel cart >> kda el far2 benhom hykon el {current} color w size
  // w ba3d kda a3melohom update bel new color and size
  // kda yb2a lazem ab3at l hena el old color and size 3shan a2dar ageb el product .. b8ad el nazzar 3n el Product_id
  // aw hashof el id bta3 el cart item nafso lw mwgod
  /* -------------------------------------------------------*/
  //{hgrab bta3et el cartItem Id }
  /* -------------------------------------------------------*/
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    const error = AppError.createError("Cart Not Found", 404, status.NOT_FOUND);
    return next(error);
  }
  // shof lw 3ndak item b nafs el color wel size
  const existingItem = cart.cartItems.find(
    (item) =>
      item.product_id.equals(product_id) &&
      item.color === color &&
      item.size === size
  );

  if (existingItem) {
    // de case en el front taleb bas yzawed el quantity bta3t el product
    existingItem.quantity += quantity; // msh += 1 ya 3la2 -_-
  } else {
    // case en mfesh item b nafs el color wel size
    // sa3tha hgeb el cart item da w ha3mel update 3leh bel vales bta3t el (size , color , quantity m price el godad )
    let itemToBeUpdated = cart.cartItems.find(
      (item) =>
        item.product_id.equals(product_id) && item._id.equals(cartItem_id)
    );

    console.log({ itemToBeUpdated });
    if (!itemToBeUpdated) {
      const error = AppError.createError(
        "cart Item was Not Found",
        404,
        status.NOT_FOUND
      );
      return next(error);
    }
    itemToBeUpdated.color = color;
    itemToBeUpdated.size = size;
    itemToBeUpdated.quantity += quantity;
    itemToBeUpdated.priceAtPurchase = priceAtPurchase;
  }

  await cart.save();
  res.json({ message: "Cart Updated Suessfully", cart });
});

//=============================checkout=======================================================
const stripeCheckout = aysncWrapper(async (req, res, nes) => {
  const { line_items, successURL, failURL } = req.body;

  const session = await Stripe.checkout.sessions.create({
    success_url: successURL,
    cancel_url: failURL,
    line_items: line_items,
    mode: "payment",
  });
  res.json({ id: session.id });
});
//============================clear cart ========================================================
const clearCart = aysncWrapper(async (req, res, next) => {
  const userId = getUserIdFromToken(req);

  if (!userId) {
    return next(AppError.createError("Unauthorized", 401, status.UNAUTHORIZED));
  }

  let cart = await Cart.findOne({ userId });
  console.log({ cart });

  if (!cart) {
    return next(AppError.createError("Cart Not Found", 404, status.NOT_FOUND));
  }

  cart.cartItems = [];
  await cart.save();
  res.json({ message: "Cart cleared successfully", cart });
});
//=============================Update Stock after success payment  =======================================================

const updateStockAfterSuccessPurchase = aysncWrapper(async (req, res, next) => {
  const userId = getUserIdFromToken(req);

  if (!userId) {
    return next(AppError.createError("Unauthorized", 401, status.UNAUTHORIZED));
  }

  let cart = await Cart.findOne({ userId });
  console.log({ cart });

  if (!cart) {
    return next(AppError.createError("Cart Not Found", 404, status.NOT_FOUND));
  }

  cart.cartItems.forEach(async (item) => {
    const { product_id, color, size, quantity } = item;
    // console.log(product_id);
    // console.log(color);
    // console.log(size);
    // console.log(quantity);

    let product = await Product.findOne({ _id: product_id });
    //  console.log(product);
    if (!product) return;

    const stockItemWithSepecific_Color = product.stock.find(
      (item) => item.color === color
    );
    // console.log(stockItemWithSepecific_Color);
    if (!stockItemWithSepecific_Color) return;

    // now check on the stockItemWithSepecific_Color if it have a size like the requested
    const stockItemWithSepecific_ColorAndSize =
      stockItemWithSepecific_Color.sizes.find((s) => s.size === size);
    if (!stockItemWithSepecific_ColorAndSize) return;

    stockItemWithSepecific_ColorAndSize.quantity -= quantity;
    await product.save();
  });

  return res.status(200).json({ message: "Stock updated Successfully" });
});
//====================================================================================
module.exports = {
  addItemToCart,
  getCartById,
  deleteItemFromCart,
  updateCart,
  updateItemQuantityFromCart,
  stripeCheckout,
  clearCart,
  updateStockAfterSuccessPurchase,
};
