const aysncWrapper = require("../middlewares/errorHandler.js");
const status = require("../utils/httpStatusText.js");
const Product = require("../models/product.model.js");
const AppError = require("../utils/appErrors.js");
// const bcrypt = require("bcryptjs");
// const generateJWT = require("../utils/generateJWT.js");
const { validationResult } = require("express-validator");

//#rejon cloud
const cloudinary = require("cloudinary").v2;
const CLOUD_NAME = "djy2bvolh";
const API_KEY = "369322986393783";
const API_SECRET = "qesxm8hVuRpK2ClX3Y0oN3HpMPA";

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

async function uploadeImage(img) {
  try {
    const result = await cloudinary.uploader.upload(img);
    console.log("Done", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.log("error", error);
    return "";
  }
}

//#end rejon

const getAllProduct = aysncWrapper(async (req, res, next) => {
  const products = await Product.find();
  console.log(products);
  res.status(200).json({ status: status.SUCCESS, data: products });
});

const getProductByCode = aysncWrapper(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findOne({ _id: id });
  console.log(product);
  if (!product) {
    const error = AppError.createError(
      "Product not found",
      404,
      status.NOT_FOUND
    );
    return next(error);
  }
  res.status(200).json({ status: status.SUCCESS, data: product });
});

const addProduct = aysncWrapper(async (req, res, next) => {
  console.log("body", req.body);
  const oldProduct = await Product.findOne({
    productCode: req.body.productCode,
  });

  const requestFields = Object.keys(req.body);

  const allowedFields = [
    "_id",
    "title",
    "description",
    "price",
    "rating",
    "quantity",
    "productCode",
    "shippingTax",
    "availableColors",
    "availableSizes",
    "categories",
    "tags",
    "brand",
    "sale",
    "hot",
    "image",
  ];

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

  console.log("oldProduct", oldProduct);
  if (oldProduct) {
    const error = AppError.createError(
      "Product already exists",
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
  const isAUrlImage =
    /^https:\/\/res\.cloudinary\.com\/[\w-]+\/image\/upload\/v\d+\/[\w-]+\.\w+$/;

  if (!isAUrlImage.test(req.body.image)) {
    let image = await uploadeImage("media/images/product/" + req.body.image);
    console.log(+req.body.image);
    if (!image) {
      const error = AppError.createError(
        "this Image Is Not Found In Project",
        400,
        status.BAD_REQUEST
      );
      return next(error);
    }
    req.body.image = image;
  }
  // hena fe ta3del 3ashan el sora httbe3t men el front mesh 7akon 3arf ma2an7a 7af3ha cloud men elfront wab3t el link

  const product = new Product({ ...req.body });
  await product.save();
  res.status(201).json({ status: status.CREATED, data: { product } });
});

const updateProduct = aysncWrapper(async (req, res, next) => {
  const id = req.params.id;
  const body = req.body;

  const errors = validationResult(req);

  const requestFields = Object.keys(body);

  const allowedFields = [
    "_id",
    "title",
    "description",
    "price",
    "rating",
    "quantity",
    "productCode",
    "shippingTax",
    "availableColors",
    "availableSizes",
    "categories",
    "tags",
    "brand",
    "sale",
    "hot",
    "image",
  ];

  const invalidFields = requestFields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (!errors.isEmpty()) {
    const error = AppError.createError(errors.array(), 400, status.BAD_REQUEST);
    return next(error);
  }

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
  const newProduct = await Product.findOneAndUpdate(
    { _id: id },
    { $set: body },
    { new: true } // Return updated document
  );
  // hena fe ta3del 3ashan el sora 3nd el update

  if (!newProduct) {
    const error = AppError.createError("User not found", 404, status.NOT_FOUND);
    return next(error);
  }

  res.json({ status: status.SUCCESS, data: { newProduct } });
});

const deleted = aysncWrapper(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findOneAndDelete({ _id: id });
  console.log(product);
  if (!product) {
    const error = AppError.createError(
      "Product not found",
      404,
      status.NOT_FOUND
    );
    return next(error);
  }
  res.status(200).json({ status: status.DELETED, data: null });
});
module.exports = {
  getAllProduct,
  getProductByCode,
  addProduct,
  updateProduct,
  deleted,
};

/*
 // just test   
const crypto = require("crypto");
const fs = require("fs");

function getETag(imagePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("md5");
    const stream = fs.createReadStream(imagePath);

    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (err) => reject(err));
  });
}
async function findImageByETag(localETag) {
  try {
    const resources = await cloudinary.api.resources(); // استرجاع كل الصور

    for (let resource of resources.resources) {
      if (resource.etag === localETag) {
        console.log("Image found:", resource.secure_url);
        return resource.secure_url; // الصورة موجودة
      }
    }

    console.log("Image not found");
    return null; // الصورة غير موجودة
  } catch (error) {
    console.log("Error fetching images:", error);
    return null;
  }
}
async function checkImageExists(imagePath) {
  try {
    const localETag = await getETag(imagePath);
    const existingImage = await findImageByETag(localETag);

    if (existingImage) {
      console.log("✅ الصورة موجودة على Cloudinary:", existingImage);
      return existingImage; // الصورة موجودة، إرجاع رابطها
    } else {
      console.log("❌ الصورة غير موجودة، يجب رفعها.");
      return "not exist"; // الصورة غير موجودة
    }
  } catch (error) {
    console.log("Error:", error);
    return "error";
  }
}
checkImageExists("../media/images/product/test.jpg");
// مثال على الاستخدام

//media\images\product\test.jpg
*/
