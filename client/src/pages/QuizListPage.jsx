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
    <section>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Quizzes</h1>
          <p className="text-secondary mb-0">Choose a quiz and submit your answers to finish.</p>
        </div>
      </div>

      {status === "loading" && <div className="alert alert-info">Loading quizzes...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {items.length === 0 && status !== "loading" && <div className="alert alert-warning">No quizzes available.</div>}

      <div className="row g-3">
        {items.map((quiz) => (
          <div className="col-md-6 col-xl-4" key={quiz._id}>
            <article className="card h-100 quiz-card">
              <div className="card-body d-flex flex-column">
                <h2 className="h5">{quiz.title}</h2>
                <p className="text-secondary flex-grow-1">{quiz.description || "No description"}</p>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="badge text-bg-light">{quiz.questions?.length || 0} questions</span>
                  <Link className="btn btn-primary btn-sm" to={`/quizzes/${quiz._id}`}>
                    Take quiz
                  </Link>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}

export default QuizListPage;
