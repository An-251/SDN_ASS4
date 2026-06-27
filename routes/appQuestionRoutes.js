const express = require("express");

const {
  createQuestion,
  deleteQuestion,
  getQuestionById,
  getQuestions,
  updateQuestion,
} = require("../controllers/questionController");
const { verifyAdmin, verifyUser } = require("../authenticate");

const router = express.Router();

router.use(verifyUser, verifyAdmin);

router.route("/").get(getQuestions).post(createQuestion);
router
  .route("/:questionId")
  .get(getQuestionById)
  .put(updateQuestion)
  .delete(deleteQuestion);

module.exports = router;
