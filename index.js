const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());


const mongoURI ="mongodb+srv://daniyalamjadali:daniyalamjadali@cluster0.h4vtslk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
 
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const catalogRoutes = require("./routes/catalog");
const productRoutes = require("./routes/product");
const usersRoutes = require("./routes/users");


app.use("/catalogs", catalogRoutes);
app.use("/products", productRoutes);
app.use('/users', usersRoutes);

// // Serve static files from the 'uploadss' folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(3002, () => {
  console.log("Server running on port 3001");
});
