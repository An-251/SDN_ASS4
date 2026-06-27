const express = require("express");

const apiClient = require("../config/apiClient");
const {
  getApiErrorMessage,
  renderUiError,
} = require("../middleware/uiErrorHandler");

const router = express.Router();

function parseList(value) {
  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function questionPayload(body) {
  return {
    text: String(body.text || "").trim(),
    options: parseList(body.options),
    keywords: parseList(body.keywords),
    correctAnswerIndex: Number(body.correctAnswerIndex),
  };
}

router.get("/", async (req, res) => {
  try {
    const { data: questions } = await apiClient.get("/questions");
    return res.render("questions/list.ejs", {
      title: "Questions",
      questions,
      currentPath: req.path,
    });
  } catch (error) {
    return renderUiError(res, error);
  }
});

router.get("/new", (req, res) => {
  res.render("questions/create.ejs", {
    title: "Create Question",
    form: {},
    error: null,
    currentPath: req.path,
  });
});

router.post("/", async (req, res) => {
  const form = req.body;

  try {
    const { data: question } = await apiClient.post(
      "/questions",
      questionPayload(form)
    );
    return res.redirect(`/questions/${question._id}`);
  } catch (error) {
    return res.status(error.response?.status || 400).render(
      "questions/create.ejs",
      {
        title: "Create Question",
        form,
        error: getApiErrorMessage(error),
        currentPath: req.path,
      }
    );
  }
});

router.get("/:questionId/edit", async (req, res) => {
  try {
    const { data: question } = await apiClient.get(
      `/questions/${req.params.questionId}`
    );
    return res.render("questions/edit.ejs", {
      title: "Edit Question",
      question,
      form: {
        ...question,
        options: question.options.join(", "),
        keywords: question.keywords.join(", "),
      },
      error: null,
      currentPath: req.path,
    });
  } catch (error) {
    return renderUiError(res, error);
  }
});

router.put("/:questionId", async (req, res) => {
  const form = req.body;

  try {
    await apiClient.put(
      `/questions/${req.params.questionId}`,
      questionPayload(form)
    );
    return res.redirect(`/questions/${req.params.questionId}`);
  } catch (error) {
    return res.status(error.response?.status || 400).render(
      "questions/edit.ejs",
      {
        title: "Edit Question",
        question: { _id: req.params.questionId },
        form,
        error: getApiErrorMessage(error),
        currentPath: req.path,
      }
    );
  }
});

router.delete("/:questionId", async (req, res) => {
  try {
    await apiClient.delete(`/questions/${req.params.questionId}`);
    return res.redirect("/questions");
  } catch (error) {
    return renderUiError(res, error);
  }
});

router.get("/:questionId", async (req, res) => {
  try {
    const { data: question } = await apiClient.get(
      `/questions/${req.params.questionId}`
    );
    return res.render("questions/details.ejs", {
      title: "Question Details",
      question,
      currentPath: req.path,
    });
  } catch (error) {
    return renderUiError(res, error);
  }
});

module.exports = router;
