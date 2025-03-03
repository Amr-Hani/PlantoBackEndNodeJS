const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express(); // create an express app
const port = process.env.PORT | 3000; // port to listen on
const mongoose = require("mongoose");
const url = process.env.MONGODB_URL;

app.use(cors());

mongoose.connect(url).then(() => {
  console.log("Connected to the database!");
});

const usersRouter = require("./routes/users.routes.js");
const productsRouter = require("./routes/product.routes.js");
app.use(express.json());
app.use("/users", usersRouter);
app.use("/products", productsRouter);
// app.get("/products", (req, res, next) => {
//   console.log("amr");
//   res.send("amr");
// });

app.all("*", (req, res) => {
  res.status(404).send("404 Not Found");
});

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    message: error.message,
    code: error.statusCode || 500,
    status: error.statusText,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
