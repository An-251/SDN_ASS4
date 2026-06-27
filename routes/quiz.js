const express = require("express");

const apiClient = require("../config/apiClient");
const {
  getApiErrorMessage,
  renderUiError,
} = require("../middleware/uiErrorHandler");

const router = express.Router();

function selectedQuestionIds(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function quizPayload(body) {
  return {
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    questions: selectedQuestionIds(body.questions),
  };
}

async function getQuestions() {
  const { data } = await apiClient.get("/questions");
  return data;
}

router.get("/", async (req, res) => {
  try {
    const { data: quizzes } = await apiClient.get("/quizzes");
    return res.render("quiz/list.ejs", {
      title: "Quizzes",
      quizzes,
      currentPath: req.path,
    });
  } catch (error) {
    return renderUiError(res, error);
  }
});

router.get("/new", async (req, res) => {
  try {
    return res.render("quiz/create.ejs", {
      title: "Create Quiz",
      questions: await getQuestions(),
      selectedQuestions: [],
      form: {},
      error: null,
      currentPath: req.path,
    });
  } catch (error) {
    return renderUiError(res, error);
  }
});

router.post("/", async (req, res) => {
  const form = req.body;

  try {
    const { data: quiz } = await apiClient.post("/quizzes", quizPayload(form));
    return res.redirect(`/quizzes/${quiz._id}`);
  } catch (error) {
    let questions = [];
    try {
      questions = await getQuestions();
    } catch {
      // Keep the original API error visible when re-rendering the form.
    }

    return res.status(error.response?.status || 400).render("quiz/create.ejs", {
      title: "Create Quiz",
      questions,
      selectedQuestions: selectedQuestionIds(form.questions),
      form,
      error: getApiErrorMessage(error),
      currentPath: req.path,
    });
  }
});

router.get("/:quizId/edit", async (req, res) => {
  try {
    const [{ data: quiz }, questions] = await Promise.all([
      apiClient.get(`/quizzes/${req.params.quizId}`),
      getQuestions(),
    ]);

    return res.render("quiz/edit.ejs", {
      title: "Edit Quiz",
      quiz,
      questions,
      selectedQuestions: quiz.questions.map((question) => question._id),
      form: quiz,
      error: null,
      currentPath: req.path,
    });
  } catch (error) {
    return renderUiError(res, error);
  }
});

router.put("/:quizId", async (req, res) => {
  const form = req.body;

  try {
    await apiClient.put(`/quizzes/${req.params.quizId}`, quizPayload(form));
    return res.redirect(`/quizzes/${req.params.quizId}`);
  } catch (error) {
    let questions = [];
    try {
      questions = await getQuestions();
    } catch {
      // Keep the original API error visible when re-rendering the form.
    }

    return res.status(error.response?.status || 400).render("quiz/edit.ejs", {
      title: "Edit Quiz",
      quiz: { _id: req.params.quizId },
      questions,
      selectedQuestions: selectedQuestionIds(form.questions),
      form,
      error: getApiErrorMessage(error),
      currentPath: req.path,
    });
  }
});

router.post("/:quizId/questions/:questionId", async (req, res) => {
  try {
    await apiClient.post(
      `/quizzes/${req.params.quizId}/questions/${req.params.questionId}`
    );
    return res.redirect(`/quizzes/${req.params.quizId}`);
  } catch (error) {
    return renderUiError(res, error);
  }
});

router.delete("/:quizId/questions/:questionId", async (req, res) => {
  try {
    await apiClient.delete(
      `/quizzes/${req.params.quizId}/questions/${req.params.questionId}`
    );
    return res.redirect(`/quizzes/${req.params.quizId}`);
  } catch (error) {
    return renderUiError(res, error);
  }
});

router.delete("/:quizId", async (req, res) => {
  try {
    await apiClient.delete(`/quizzes/${req.params.quizId}`);
    return res.redirect("/quizzes");
  } catch (error) {
    return renderUiError(res, error);
  }
});

router.get("/:quizId", async (req, res) => {
  try {
    const [{ data: quiz }, allQuestions] = await Promise.all([
      apiClient.get(`/quizzes/${req.params.quizId}`),
      getQuestions(),
    ]);
    const attachedIds = new Set(
      quiz.questions.map((question) => question._id.toString())
    );

    return res.render("quiz/details.ejs", {
      title: "Quiz Details",
      quiz,
      availableQuestions: allQuestions.filter(
        (question) => !attachedIds.has(question._id.toString())
      ),
      currentPath: req.path,
    });
  } catch (error) {
    return renderUiError(res, error);
  }
});

module.exports = router;
