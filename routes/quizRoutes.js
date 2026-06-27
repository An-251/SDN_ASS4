const express = require("express");

const {
  addQuestionToQuiz,
  addQuestionsToQuiz,
  attachQuestionToQuiz,
  createQuiz,
  deleteQuiz,
  detachQuestionFromQuiz,
  getQuizById,
  getQuizzes,
  getQuizWithCapitalQuestions,
  updateQuiz,
} = require("../controllers/quizController");
const { verifyAdmin, verifyUser } = require("../authenticate");

const router = express.Router();
const adminOnly = [verifyUser, verifyAdmin];

router.route("/").get(getQuizzes).post(...adminOnly, createQuiz);
router.get("/:quizId/populate", getQuizWithCapitalQuestions);
router.post("/:quizId/question", ...adminOnly, addQuestionToQuiz);
router.post("/:quizId/questions", ...adminOnly, addQuestionsToQuiz);
router
  .route("/:quizId/questions/:questionId")
  .post(...adminOnly, attachQuestionToQuiz)
  .delete(...adminOnly, detachQuestionFromQuiz);
router
  .route("/:quizId")
  .get(getQuizById)
  .put(...adminOnly, updateQuiz)
  .delete(...adminOnly, deleteQuiz);

module.exports = router;
