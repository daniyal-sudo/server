const express = require("express");

// const cors = require("cors");
// const path = require("path");
require("dotenv").config();

const app = express();
// app.use(cors());
app.use(express.json());


const connectDB = require("./dbconnection");

connectDB();

const productModel =require('./models/Product')
const Catalog =require('./models/Catalog')

// const catalogRoutes = require("./routes/catalog");
// const productRoutes = require("./routes/product");
// const usersRoutes = require("./routes/users");


// app.use("/catalogs", catalogRoutes);
// app.use("/products", productRoutes);
// app.use('/users', usersRoutes);

// // Serve static files from the 'uploadss' folder
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// console.log('www22333')


app.post("/get_Product", async (req, res) => {
  const { filter, search } = req.body;

  try {
    const query = {};

    if (filter && filter.length > 0) {
      query.catalog_type = { $in: filter };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await ProductModel.find(query).populate("catalog_type");
    res.json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve products",
      error: err.message,
    });
  }
});
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log('www22555')
  console.log("Server is running on port " + PORT);
});


 // "start": "nodemon index.js"