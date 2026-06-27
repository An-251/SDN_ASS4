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
      <section className="quiz-shell mx-auto">
        <div className="card">
          <div className="card-body">
            <h1 className="h3">Finish quiz: {result.title}</h1>
            <p className="lead">
              Score: <strong>{result.score}</strong> / {result.total}
            </p>
            <div className="vstack gap-2">
              {result.results.map((item, index) => (
                <div className="border rounded p-3" key={item.questionId}>
                  <div className="d-flex justify-content-between gap-3">
                    <strong>
                      {index + 1}. {item.text}
                    </strong>
                    <span className={`badge ${item.isCorrect ? "text-bg-success" : "text-bg-danger"}`}>
                      {item.isCorrect ? "Correct" : "Wrong"}
                    </span>
                  </div>
                  <p className="mb-0 small text-secondary">
                    Your answer index: {item.selectedIndex ?? "No answer"} | Correct index: {item.correctAnswerIndex}
                  </p>
                </div>
              ))}
            </div>
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-outline-primary" type="button" onClick={resetAttempt}>
                Try again
              </button>
              <Link className="btn btn-primary" to="/quizzes">
                Back to quizzes
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="quiz-shell mx-auto">
      <div className="mb-4">
        <h1 className="h2">{quiz.title}</h1>
        <p className="text-secondary">{quiz.description}</p>
      </div>
      {quiz.questions?.length === 0 && <div className="alert alert-warning">This quiz has no questions.</div>}
      <form className="vstack gap-3" onSubmit={handleSubmit}>
        {quiz.questions?.map((question, questionIndex) => (
          <fieldset className="card" key={question._id}>
            <div className="card-body">
              <legend className="h5">
                {questionIndex + 1}. {question.text}
              </legend>
              <div className="vstack gap-2 mt-3">
                {question.options.map((option, optionIndex) => (
                  <label className="form-check option-row" key={`${question._id}-${optionIndex}`}>
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
            </div>
          </fieldset>
        ))}
        <button className="btn btn-success btn-lg" type="submit" disabled={status === "loading" || quiz.questions?.length === 0}>
          {status === "loading" ? "Submitting..." : "Submit answers"}
        </button>
      </form>
    </section>
  );
}

export default QuizTakePage;
