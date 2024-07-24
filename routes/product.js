const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Catalog = require("../models/Catalog");
const ProductModel = require("../models/Product");

const fs = require("fs");
const authenticate = require("../middleware/Authentication");

// Configure Multer for file uploads
const uploadDir = path.join(__dirname, "../uploads/images/productImges");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the dynamically created directory
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.post("/upload_images", authenticate,upload.single("file"), (req, res) => {
  console.log(req);
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const filePath = `http://localhost:3001/uploads/images/productImges/${req.file.filename}`;
  res.status(200).json({
    message: "File uploaded successfully",
    url: filePath,
    file_name: req.file.filename,
  });
});


// Delete image route
router.post("/delete_image", authenticate,(req, res) => {
  const { filename } = req.body;
  
  if (!filename) {
    return res.status(400).json({ message: "No filename provided" });
  }

  const filePath = path.join(__dirname, '..', 'uploads', 'images', 'productImges', filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to delete file", error: err });
    }
    res.status(200).json({ message: "File deleted successfully" });
  });
});
// Get Products
router.post("/get_Product", async (req, res) => {
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


// Create a new product
router.post("/create_Product", authenticate, async (req, res) => {
  const { name, color, weight, catalog_type, images, price, description } = req.body;

  console.log("Request body:", req.body);

  // Basic validation
  if (
    !name ||
    !color ||
    !weight ||
    !Array.isArray(catalog_type) ||
    !images ||
    !price  ||
    !description
  ) {
    console.error(
      "Validation failed: Missing fields or catalog_type is not an array"
    );
    return res.status(400).json({
      success: false,
      message: "All fields are required and catalog_type must be an array",
    });
  }

  try {
    // Find catalogs with the provided IDs
    console.log("Finding catalogs with IDs:", catalog_type);
    const catalogs = await Catalog.find({ _id: { $in: catalog_type } });

    console.log("Catalogs found:", catalogs);

    // Check if the number of found catalogs matches the number of provided IDs
    if (catalogs.length !== catalog_type.length) {
      console.error("Validation failed: One or more catalog IDs are invalid");
      return res.status(400).json({
        success: false,
        message: "One or more catalog IDs are invalid",
      });
    }

    // Create a new product
    const product = new ProductModel({
      name,
      color,
      weight,
      catalog_type,
      images,
      price,
      description,
    });

    await product.save();

    // Create catalog details map by ID for quick lookup
    const catalogMap = catalogs.reduce((acc, catalog) => {
      acc[catalog._id] = {
        _id: catalog._id,
        name: catalog.name,
        image: catalog.image,
        description: catalog.description
      };
      return acc;
    }, {});

    // Replace catalog IDs in product with complete catalog objects
    const productWithFullCatalogs = {
      ...product._doc,
      catalog_type: catalog_type.map(id => catalogMap[id])
    };

    // Respond with success and updated product details
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: productWithFullCatalogs,
    });
  } catch (err) {
    // Handle any errors that occur during the process
    console.error("Error occurred while creating product:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: err.message,
    });
  }
});



// Update a product
router.post("/update_Product", authenticate, async (req, res) => {
  const { productId, name, color, weight, catalog_type, images, price, description } = req.body;

  console.log("Request body:", req.body);

  // Basic validation
  if (
    !productId ||
    !name ||
    !color ||
    !weight ||
    !Array.isArray(catalog_type) ||
    !images ||
    !price ||
    !description
  ) {
    console.error(
      "Validation failed: Missing fields or catalog_type is not an array"
    );
    return res.status(400).json({
      success: false,
      message: "All fields are required and catalog_type must be an array",
    });
  }

  try {
    // Find catalogs with the provided IDs
    console.log("Finding catalogs with IDs:", catalog_type);
    const catalogs = await Catalog.find({ _id: { $in: catalog_type } });

    console.log("Catalogs found:", catalogs);

    // Check if the number of found catalogs matches the number of provided IDs
    if (catalogs.length !== catalog_type.length) {
      console.error("Validation failed: One or more catalog IDs are invalid");
      return res.status(400).json({
        success: false,
        message: "One or more catalog IDs are invalid",
      });
    }

    // Update the product
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { name, color, weight, catalog_type, images, price, description },
      { new: true }
    );

    if (!updatedProduct) {
      console.error("Validation failed: Invalid product ID");
      return res.status(400).json({
        success: false,
        message: "Product not found",
      });
    }

    // Create catalog details map by ID for quick lookup
    const catalogMap = catalogs.reduce((acc, catalog) => {
      acc[catalog._id] = {
        _id: catalog._id,
        name: catalog.name,
        image: catalog.image,
        description: catalog.description
      };
      return acc;
    }, {});

    // Replace catalog IDs in updatedProduct with complete catalog objects
    const productWithFullCatalogs = {
      ...updatedProduct._doc,
      catalog_type: catalog_type.map(id => catalogMap[id])
    };

    // Respond with success and updated product details
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: productWithFullCatalogs,
    });
  } catch (err) {
    // Handle any errors that occur during the process
    console.error("Error occurred while updating product:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: err.message,
    });
  }
});


module.exports = router;
