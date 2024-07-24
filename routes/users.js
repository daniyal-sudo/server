const express = require("express");
// Adjust the path as needed
const router = express.Router();
const User = require("../models/Admin");
const jwt = require("jsonwebtoken");

// router.post("/signup", async (req, res) => {
//   const { full_name, email, password, confirm_password } = req.body;

//   if (password !== confirm_password) {
//     return res.status(400).json({ message: "Passwords do not match" });
//   }

//   try {
//     const userExists = await User.findOne({ email });

//     if (userExists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const user = new User({ full_name, email, password });
//     await user.save();

//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// });

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(200).json({ success:false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, "your_jwt_secret", {
      expiresIn: "24h",
    });

    res.json({
      token: token,
      full_name: user.full_name,
      type: user.type,
      success:true,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
module.exports = router;
