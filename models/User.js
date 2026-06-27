const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const saltRounds = 10;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      default: "",
      trim: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    admin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.setPassword = function setPassword(password) {
  this.passwordHash = bcrypt.hashSync(String(password), saltRounds);
};

userSchema.methods.validatePassword = function validatePassword(password) {
  return bcrypt.compareSync(String(password), this.passwordHash);
};

userSchema.statics.register = async function register(data) {
  const user = new this({
    username: String(data.username || "").trim(),
    admin: data.admin === true || data.admin === "true",
  });

  user.setPassword(data.password);
  return user.save();
};

module.exports = mongoose.model("User", userSchema);
