function getApiErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === "ECONNREFUSED") {
    return "Cannot connect to the Assignment 01 API.";
  }

  return error.message || "An unexpected error occurred.";
}

function renderUiError(res, error, status = 500) {
  return res.status(error.response?.status || status).render("error.ejs", {
    title: "Request Error",
    message: getApiErrorMessage(error),
    currentPath: "",
  });
}

module.exports = {
  getApiErrorMessage,
  renderUiError,
};
