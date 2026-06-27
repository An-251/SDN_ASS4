const express = require("express");

const router = express.Router();

router.get("/", (_req, res) => {
  res.redirect("/app/login");
});

router.get("/legacy", (req, res) => {
  res.render("partials/index.ejs", {
    title: "Question Bank",
    currentPath: req.path,
  });
});

module.exports = router;
