const asyncWrapper = require("../middlewares/errorHandler.js");
const status = require("../utils/httpStatusText.js");
const Product = require("../models/product.model.js");
const AppError = require("../utils/appErrors.js");
// const bcrypt = require("bcryptjs");
// const generateJWT = require("../utils/generateJWT.js");
const { validationResult } = require("express-validator");
//#rejon cloud
const cloudinary = require("cloudinary").v2;
const CLOUD_NAME = process.env.CLOUD_NAME;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

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

const getAllProduct = asyncWrapper(async (req, res, next) => {
  const sortOrder = req.query.order === "desc" ? -1 : 1;
  const sortField = req.query.sortBy || "price";
  const products = await Product.find().sort({ [sortField]: sortOrder });
  console.log(products);
  res.status(200).json({ status: status.SUCCESS, data: products });
});

const getProductByCode = asyncWrapper(async (req, res, next) => {
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

const addProduct = asyncWrapper(async (req, res, next) => {
  console.log("body", req.body);

  const requestFields = Object.keys(req.body);
  let requestFieldsInStock;
  let requestFieldsInStockInSize;

  // const allowedFields = [
  //   "_id",
  //   "title",
  //   "description",
  //   "price",
  //   "rating",
  //   "quantity",
  //   "productCode",
  //   "shippingTax",
  //   "availableColors",
  //   "availableSizes",
  //   "categories",
  //   "tags",
  //   "brand",
  //   "sale",
  //   "hot",
  //   "image",
  // ];

  const allowedFields = [
    "title",
    "description",
    "price",
    "rating",
    "productCode",
    "shippingTax",
    "stock",
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

  // requestFieldsInStock = Object.keys(req.body.stock[0]);
  // console.log(requestFieldsInStock);
  // const invalidFieldsInStock = requestFieldsInStock.filter(
  //   (field) => !allowedFieldsInStock.includes(field)
  // );

  if (!Array.isArray(req.body.stock)) {
    const error = AppError.createError(
      "Stock must be an array",
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
  if (req.body.stock.length === 0) {
    const error = AppError.createError(
      "Please provide at least one valid field (color, sizes)",
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }

  const allowedFieldsInStock = ["color", "sizes"];
  const invalidFieldsInStock = req.body.stock.flatMap((item) =>
    Object.keys(item).filter((field) => !allowedFieldsInStock.includes(field))
  );

  if (invalidFieldsInStock.length > 0) {
    const error = AppError.createError(
      `Invalid fields:( ${invalidFieldsInStock.join(
        ", "
      )} ) Allowed fields: (${allowedFieldsInStock.join(", ")})`,
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }

  const allowedFieldsInSizes = ["size", "quantity"];

  for (const stockItem of req.body.stock) {
    if (!Array.isArray(stockItem.sizes)) {
      const error = AppError.createError(
        "Sizes must be an array",
        400,
        status.BAD_REQUEST
      );
      return next(error);
    }

    if (stockItem.sizes.length === 0) {
      const error = AppError.createError(
        "Please provide at least one valid field (size, quantity)",
        400,
        status.BAD_REQUEST
      );
      return next(error);
    }

    const invalidFieldsInSizes = stockItem.sizes.flatMap((sizeItem) =>
      Object.keys(sizeItem).filter(
        (field) => !allowedFieldsInSizes.includes(field)
      )
    );

    if (invalidFieldsInSizes.length > 0) {
      const error = AppError.createError(
        `Invalid fields in sizes: ( ${[...new Set(invalidFieldsInSizes)].join(
          ", "
        )} ) Allowed fields: (${allowedFieldsInSizes.join(", ")})`,
        400,
        status.BAD_REQUEST
      );
      return next(error);
    }
  }

  const oldProduct = await Product.findOne({
    productCode: req.body.productCode,
  });

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

const updateProduct = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  const body = req.body;

  const errors = validationResult(req);

  const requestFields = Object.keys(body);

  const allowedFields = [
    "title",
    "description",
    "price",
    "rating",
    "productCode",
    "shippingTax",
    "stock",
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

const deleted = asyncWrapper(async (req, res, next) => {
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

const getProductsByPram = asyncWrapper(async (req, res, next) => {
  const filterBy = req.params.dynamicParam;
  const param = req.params.paramName;
  const sortOrder = req.query.order === "desc" ? -1 : 1; // `asc` = 1, `desc` = -1
  const sortField = req.query.sortBy || "price";
  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
  const allowedFields = [
    "title",
    "description",
    "price",
    "rating",
    "productCode",
    "shippingTax",
    "stock",
    "categories",
    "tags",
    "brand",
    "sale",
    "hot",
    "image",
  ];
  if (!allowedFields.includes(filterBy)) {
    const error = AppError.createError(
      `Invalid fields:( ${filterBy} ) Allowed fields: (${allowedFields.join(
        ", "
      )})`,
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }

  let filter = {
    [filterBy]: { $regex: param, $options: "i" },
  };

  if (minPrice !== null || maxPrice !== null) {
    filter.price = {};
    if (minPrice !== null) filter.price.$gte = minPrice;
    if (maxPrice !== null) filter.price.$lte = maxPrice;
  }

  console.log("Filter:", filter);

  const products = await Product.find(filter).sort({ [sortField]: sortOrder });
  console.log(products.length);
  if (!products.length) {
    const error = AppError.createError(
      `Products in this ${filterBy} not found`,
      404,
      status.NOT_FOUND
    );
    return next(error);
  }
  res.json({ stetus: status.SUCCESS, data: products });
});

// http://localhost:3000/products/tag/gaming?minPrice=100&maxPrice=500&order=asc

module.exports = {
  getAllProduct,
  getProductByCode,
  addProduct,
  updateProduct,
  deleted,
  getProductsByPram,
  // getProductsByCategory,
  // getProductsByTag,
};

// const getProductsByCategory = asyncWrapper(async (req, res, next) => {
//   const categorieName = req.params.catName;
//   console.log(categorieName);
//   const sortOrder = req.query.order === "desc" ? -1 : 1; // `asc` = 1, `desc` = -1

//   const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
//   const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

//   console.log(sortOrder);
//   console.log(minPrice);
//   console.log(maxPrice);

//   let filter = {
//     categories: { $regex: categorieName, $options: "i" },
//   };

//   if (minPrice !== null || maxPrice !== null) {
//     filter.price = {};
//     if (minPrice !== null) filter.price.$gte = minPrice;
//     if (maxPrice !== null) filter.price.$lte = maxPrice;
//   }

//   console.log("Filter:", filter);

//   const products = await Product.find(filter).sort({ categories: sortOrder });
//   console.log(products.length);
//   if (!products.length) {
//     const error = AppError.createError(
//       "Products in this categorie not found",
//       404,
//       status.NOT_FOUND
//     );
//     return next(error);
//   }
//   res.json({ stetus: status.SUCCESS, data: products });
// });

// const getProductsByTag = asyncWrapper(async (req, res, next) => {
//   const categorieName = req.params.tagName;
//   const sortOrder = req.query.order === "desc" ? -1 : 1;

//   const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
//   const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

//   console.log(sortOrder);
//   console.log(minPrice);
//   console.log(maxPrice);

//   const products = await Product.find({
//     tags: { $regex: categorieName, $options: "i" },
//     price: {
//       ...(minPrice !== null ? { $gte: minPrice } : {}),
//       ...(maxPrice !== null ? { $lte: maxPrice } : {}),
//     },
//   }).sort({ tags: sortOrder });

//   if (!products.length) {
//     const error = AppError.createError(
//       "Products in this Tag not found",
//       404,
//       status.NOT_FOUND
//     );
//     return next(error);
//   }
//   res.json({ status: status.SUCCESS, data: products });
// });

// // http://localhost:3000/products/tag/gaming?minPrice=100&maxPrice=500&order=asc

// const getProductsByTag = asyncWrapper(async (req, res, next) => {
//   const categorieName = req.params.tagName;
//   const sortOrder = req.query.order === "desc" ? -1 : 1; // `asc` = 1, `desc` = -1
//   console.log(sortOrder);

//   const products = await Product.find({
//     tags: { $regex: categorieName, $options: "i" },
//   }).sort({ tags: sortOrder });
//   if (!products.length) {
//     const error = AppError.createError(
//       "Products in this Tag not found",
//       404,
//       status.NOT_FOUND
//     );
//     return next(error);
//   }
//   res.json({ stetus: status.SUCCESS, data: products });
// });

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
