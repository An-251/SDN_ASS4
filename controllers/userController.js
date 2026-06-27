const { getToken } = require("../authenticate");
const User = require("../models/User");

function publicUser(user) {
  return {
    _id: user._id,
    username: user.username,
    admin: user.admin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function getUsers(req, res, next) {
  try {
    const users = await User.find().select("-passwordHash");
    return res.json(users);
  } catch (error) {
    return next(error);
  }
}

async function signup(req, res, next) {
  try {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const user = await User.register(req.body);

    return res.status(201).json({
      user: publicUser(user),
      token: getToken(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username already exists" });
    }

    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const user = await User.findOne({
      username: String(req.body.username || "").trim(),
    }).select("+passwordHash");

    if (!user || !user.validatePassword(req.body.password || "")) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    return res.json({
      user: publicUser(user),
      token: getToken(user),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  login,
  signup,
};
