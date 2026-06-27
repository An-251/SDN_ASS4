import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearQuizResult, fetchQuiz, submitQuiz } from "../store/quizSlice.js";

function QuizTakePage() {
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const { selected: quiz, result, status, error } = useSelector((state) => state.quizzes);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    setAnswers({});
    dispatch(fetchQuiz(quizId));
  }, [dispatch, quizId]);

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers((current) => ({ ...current, [questionId]: optionIndex }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(submitQuiz({ quizId, answers }));
  };

  const resetAttempt = () => {
    setAnswers({});
    dispatch(clearQuizResult());
  };

  if (status === "loading" && !quiz) {
    return <div className="alert alert-info">Loading quiz...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!quiz) {
    return null;
  }

  if (result) {
    return (
      <section className="quiz-completed text-center">
        <h1>Quiz Completed</h1>
        <p>
          Your score: {result.score}
          {result.total ? ` / ${result.total}` : ""}
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
          <button className="btn btn-primary" type="button" onClick={resetAttempt}>
            Restart Quiz
          </button>
          <Link className="btn btn-outline-secondary" to="/quizzes">
            Back to quizzes
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="quiz-shell">
      <div className="quiz-heading text-center">
        <h1>Quiz</h1>
        <p>{quiz.title}</p>
      </div>
      {quiz.questions?.length === 0 && <div className="alert alert-warning">This quiz has no questions.</div>}
      <form className="quiz-form" onSubmit={handleSubmit}>
        {quiz.questions?.map((question, questionIndex) => (
          <fieldset className="quiz-question-block" key={question._id}>
            <legend>
              {quiz.questions.length > 1 ? `${questionIndex + 1}. ` : ""}
              {question.text}
            </legend>
            <div className="quiz-options">
              {question.options.map((option, optionIndex) => (
                <label className="form-check" key={`${question._id}-${optionIndex}`}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name={question._id}
                    checked={answers[question._id] === optionIndex}
                    onChange={() => handleAnswer(question._id, optionIndex)}
                  />
                  <span className="form-check-label">{option}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <button className="btn btn-primary quiz-submit" type="submit" disabled={status === "loading" || quiz.questions?.length === 0}>
          {status === "loading" ? "Submitting..." : "Submit answers"}
        </button>
      </form>
    </section>
  );
}

export default QuizTakePage;
