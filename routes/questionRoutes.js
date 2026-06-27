const express = require("express");

const {
  createQuestion,
  deleteQuestion,
  getQuestionById,
  getQuestions,
  updateQuestion,
} = require("../controllers/questionController");
const { verifyAuthor, verifyUser } = require("../authenticate");

const router = express.Router();

router.route("/").get(getQuestions).post(verifyUser, createQuestion);
router
  .route("/:questionId")
  .get(getQuestionById)
  .put(verifyUser, verifyAuthor, updateQuestion)
  .delete(verifyUser, verifyAuthor, deleteQuestion);

module.exports = router;
