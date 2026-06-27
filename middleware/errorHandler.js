const mongoose = require("mongoose");

function handleNotFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

function handleError(error, req, res, next) {
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: error.message,
      errors: Object.values(error.errors).map((item) => item.message),
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Invalid ${error.path}` });
  }

  if (!error.status || error.status >= 500) {
    console.error(error);
  }

  return res.status(error.status || 500).json({
    message: error.message || "Internal server error",
  });
}

module.exports = {
  handleError,
  handleNotFound,
};
