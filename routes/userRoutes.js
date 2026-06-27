const express = require("express");

const { getUsers, login, signup } = require("../controllers/userController");
const { verifyAdmin, verifyUser } = require("../authenticate");

const router = express.Router();

router.get("/", verifyUser, verifyAdmin, getUsers);
router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
