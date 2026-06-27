const Question = require("../models/Question");
const Quiz = require("../models/Quiz");

function questionUpdatePayload(body) {
  const allowedFields = ["text", "options", "keywords", "correctAnswerIndex"];

  return allowedFields.reduce((payload, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = body[field];
    }

    return payload;
  }, {});
}

async function getQuestions(req, res, next) {
  try {
    const questions = await Question.find().populate("author", "username admin");
    res.json(questions);
  } catch (error) {
    next(error);
  }
}

async function getQuestionById(req, res, next) {
  try {
    const question = await Question.findById(req.params.questionId).populate(
      "author",
      "username admin"
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    return res.json(question);
  } catch (error) {
    return next(error);
  }
}

async function createQuestion(req, res, next) {
  try {
    const question = await Question.create({
      ...req.body,
      author: req.user._id,
    });
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
}

async function updateQuestion(req, res, next) {
  try {
    const question =
      req.question || (await Question.findById(req.params.questionId));

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    Object.assign(question, questionUpdatePayload(req.body));
    await question.save();

    return res.json(question);
  } catch (error) {
    return next(error);
  }
}

async function deleteQuestion(req, res, next) {
  try {
    const question =
      req.question || (await Question.findById(req.params.questionId));

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    await Question.findByIdAndDelete(question._id);

    await Quiz.updateMany(
      { questions: question._id },
      { $pull: { questions: question._id } }
    );

    return res.json({ message: "Question deleted successfully" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createQuestion,
  deleteQuestion,
  getQuestionById,
  getQuestions,
  updateQuestion,
};
