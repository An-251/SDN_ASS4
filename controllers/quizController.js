const Question = require("../models/Question");
const Quiz = require("../models/Quiz");

function sanitizeQuestionForUser(question) {
  const plainQuestion = question.toObject ? question.toObject() : { ...question };

  delete plainQuestion.correctAnswerIndex;
  delete plainQuestion.__v;

  return plainQuestion;
}

function sanitizeQuizForUser(quiz) {
  const plainQuiz = quiz.toObject ? quiz.toObject() : { ...quiz };

  plainQuiz.questions = (plainQuiz.questions || []).map((question) =>
    typeof question === "object" && question !== null
      ? sanitizeQuestionForUser(question)
      : question
  );
  delete plainQuiz.__v;

  return plainQuiz;
}

async function getQuizzes(req, res, next) {
  try {
    const quizzes = await Quiz.find().populate({
      path: "questions",
      populate: {
        path: "author",
        select: "username admin",
      },
    });
    res.json(quizzes);
  } catch (error) {
    next(error);
  }
}

async function getAppQuizzes(req, res, next) {
  try {
    const quizzes = await Quiz.find()
      .populate({
        path: "questions",
        populate: {
          path: "author",
          select: "username admin",
        },
      })
      .sort({ createdAt: -1 });

    if (req.user.admin) {
      return res.json(quizzes);
    }

    return res.json(quizzes.map(sanitizeQuizForUser));
  } catch (error) {
    return next(error);
  }
}

async function getQuizById(req, res, next) {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate({
      path: "questions",
      populate: {
        path: "author",
        select: "username admin",
      },
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.json(quiz);
  } catch (error) {
    return next(error);
  }
}

async function getAppQuizById(req, res, next) {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate({
      path: "questions",
      populate: {
        path: "author",
        select: "username admin",
      },
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (req.user.admin) {
      return res.json(quiz);
    }

    return res.json(sanitizeQuizForUser(quiz));
  } catch (error) {
    return next(error);
  }
}

async function createQuiz(req, res, next) {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (error) {
    next(error);
  }
}

async function updateQuiz(req, res, next) {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.quizId, req.body, {
      new: true,
      runValidators: true,
    }).populate({
      path: "questions",
      populate: {
        path: "author",
        select: "username admin",
      },
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.json(quiz);
  } catch (error) {
    return next(error);
  }
}

async function deleteQuiz(req, res, next) {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    return next(error);
  }
}

async function submitQuiz(req, res, next) {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate("questions");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const answers = req.body.answers || {};
    let score = 0;

    const results = quiz.questions.map((question) => {
      const questionId = question._id.toString();
      const selectedIndex = Number.parseInt(answers[questionId], 10);
      const isCorrect = selectedIndex === question.correctAnswerIndex;

      if (isCorrect) {
        score += 1;
      }

      return {
        questionId,
        text: question.text,
        options: question.options,
        selectedIndex: Number.isInteger(selectedIndex) ? selectedIndex : null,
        correctAnswerIndex: question.correctAnswerIndex,
        isCorrect,
      };
    });

    return res.json({
      quizId: quiz._id,
      title: quiz.title,
      score,
      total: quiz.questions.length,
      results,
    });
  } catch (error) {
    return next(error);
  }
}

async function getQuizWithCapitalQuestions(req, res, next) {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate({
      path: "questions",
      match: {
        $or: [
          { text: { $regex: "capital", $options: "i" } },
          { keywords: { $regex: "capital", $options: "i" } },
        ],
      },
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.json(quiz);
  } catch (error) {
    return next(error);
  }
}

async function addQuestionToQuiz(req, res, next) {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const question = await Question.create({
      ...req.body,
      author: req.user._id,
    });
    quiz.questions.push(question._id);
    await quiz.save();

    return res.status(201).json(question);
  } catch (error) {
    return next(error);
  }
}

async function addQuestionsToQuiz(req, res, next) {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        message: "Request body must be a non-empty array of questions",
      });
    }

    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const questions = await Question.create(
      req.body.map((question) => ({
        ...question,
        author: req.user._id,
      }))
    );
    quiz.questions.push(...questions.map((question) => question._id));
    await quiz.save();

    return res.status(201).json({
      message: "Questions added successfully",
      questions,
    });
  } catch (error) {
    return next(error);
  }
}

async function attachQuestionToQuiz(req, res, next) {
  try {
    const [quiz, question] = await Promise.all([
      Quiz.findById(req.params.quizId),
      Question.findById(req.params.questionId),
    ]);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const alreadyAttached = quiz.questions.some(
      (questionId) => questionId.toString() === question._id.toString()
    );

    if (!alreadyAttached) {
      quiz.questions.push(question._id);
      await quiz.save();
    }

    return res.json(await quiz.populate("questions"));
  } catch (error) {
    return next(error);
  }
}

async function detachQuestionFromQuiz(req, res, next) {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      { $pull: { questions: req.params.questionId } },
      { new: true, runValidators: true }
    ).populate("questions");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.json(quiz);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  addQuestionToQuiz,
  addQuestionsToQuiz,
  attachQuestionToQuiz,
  createQuiz,
  deleteQuiz,
  detachQuestionFromQuiz,
  getAppQuizById,
  getAppQuizzes,
  getQuizById,
  getQuizzes,
  getQuizWithCapitalQuestions,
  submitQuiz,
  updateQuiz,
};
