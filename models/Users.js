const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usersSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  date_of_birth: { type: String, required: true },
  address: { type: String, required: true },
  gender: { type: String, required: true },
  phone_number: { type: String, required: true },
  password: { type: String, required: true },
  confirm_password: { type: String, required: true },
});
usersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("Users", usersSchema);
