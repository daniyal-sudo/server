const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Catalog = require("../models/Catalog");
const fs = require("fs");
const authenticate = require("../middleware/Authentication");

// Configure Multer for file uploads
const uploadDir = path.join(__dirname, '../uploads/images/categoriesImges');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the dynamically created directory
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post("/upload_images",authenticate, upload.single("file"), (req, res) => {

  console.log(req)
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const filePath = `http://localhost:3001/uploads/images/categoriesImges/${req.file.filename}`;
  res.status(200).json({
    message: "File uploaded successfully",
    url: filePath,
    file_name:req.file.filename
  });
});

// Create a new catalog
router.post('/create_category', authenticate, async (req, res) => {
  try {
    const catalog = new Catalog({
      name: req.body.name,
      image: req.body.image || null, // Image URL from the request body
      description: req.body.description,
    });
    await catalog.save();
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: catalog,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: err.message,
    });
  }
});

// Get all catalogs
router.post('/get_categories', async (req, res) => {
  const { search } = req.body;

  try {
    let query = {};

    if (search) {
      query = { name: { $regex: search, $options: 'i' } }; // case-insensitive search on 'name'
    }

    const catalogs = await Catalog.find(query);

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: catalogs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: err.message,
    });
  }
});


// Update a catalog
router.post('/update_category', authenticate, async (req, res) => {
  try {
    const catalog = await Catalog.findById(req.body.id);
    if (!catalog) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    catalog.name = req.body.name || catalog.name;
    catalog.description = req.body.description || catalog.description;
    catalog.image = req.body.image || catalog.image; // Update image URL if provided

    await catalog.save();
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: catalog,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: err.message,
    });
  }
});

// Delete a catalog
router.post('/delete_category', authenticate, async (req, res) => {
  try {
    const catalog = await Catalog.findById(req.body.id);
    if (!catalog) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    await catalog.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: err.message,
    });
  }
});


module.exports = router;
