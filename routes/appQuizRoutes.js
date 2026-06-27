const express = require("express");

const {
  attachQuestionToQuiz,
  createQuiz,
  deleteQuiz,
  detachQuestionFromQuiz,
  getAppQuizById,
  getAppQuizzes,
  submitQuiz,
  updateQuiz,
} = require("../controllers/quizController");
const { verifyAdmin, verifyUser } = require("../authenticate");

const router = express.Router();
const adminOnly = [verifyUser, verifyAdmin];

router.use(verifyUser);

router.route("/").get(getAppQuizzes).post(verifyAdmin, createQuiz);
router.post("/:quizId/submit", submitQuiz);
router
  .route("/:quizId/questions/:questionId")
  .post(...adminOnly, attachQuestionToQuiz)
  .delete(...adminOnly, detachQuestionFromQuiz);
router
  .route("/:quizId")
  .get(getAppQuizById)
  .put(verifyAdmin, updateQuiz)
  .delete(verifyAdmin, deleteQuiz);

module.exports = router;
