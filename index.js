const express = require("express");

const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());


const connectDB = require("./dbconnection");

connectDB();

const catalogRoutes = require("./routes/catalog");
const productRoutes = require("./routes/product");
const usersRoutes = require("./routes/users");


app.use("/catalogs", catalogRoutes);
app.use("/products", productRoutes);
app.use('/users', usersRoutes);

// // Serve static files from the 'uploadss' folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log('www22333')
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log('www22555')
  console.log("Server is running on port " + PORT);
});


 // "start": "nodemon index.js"