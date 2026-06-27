import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuizzes } from "../store/quizSlice.js";

function QuizListPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.quizzes);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  return (
    <section className="quiz-index">
      <h1 className="page-heading text-center">Quiz</h1>

      {status === "loading" && <div className="alert alert-info">Loading quizzes...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {items.length === 0 && status !== "loading" && <div className="alert alert-warning">No quizzes available.</div>}

      <div className="quiz-list">
        {items.map((quiz) => (
          <article className="assignment-card quiz-list-item" key={quiz._id}>
            <div>
              <h2>{quiz.title}</h2>
              <p>{quiz.description || "No description"}</p>
              <span className="text-secondary">{quiz.questions?.length || 0} questions</span>
            </div>
            <Link className="btn btn-primary" to={`/quizzes/${quiz._id}`}>
              Take quiz
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default QuizListPage;
