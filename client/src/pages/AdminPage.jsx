import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiRequest, splitList } from "../api.js";

const emptyQuestion = {
  id: null,
  text: "",
  options: ["", "", "", ""],
  keywordsText: "",
  correctAnswerIndex: 0,
};

const emptyQuiz = {
  id: null,
  title: "",
  description: "",
  questions: [],
};

function AdminPage() {
  const { token } = useSelector((state) => state.auth);
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [questionForm, setQuestionForm] = useState(emptyQuestion);
  const [quizForm, setQuizForm] = useState(emptyQuiz);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [questionData, quizData] = await Promise.all([
        apiRequest("/questions", { token }),
        apiRequest("/quizzes", { token }),
      ]);
      setQuestions(questionData);
      setQuizzes(quizData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const submitQuestion = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const options = questionForm.options.map((option) => option.trim()).filter(Boolean);
    const payload = {
      text: questionForm.text,
      options,
      keywords: splitList(questionForm.keywordsText),
      correctAnswerIndex: Number.parseInt(questionForm.correctAnswerIndex, 10),
    };

    try {
      if (questionForm.id) {
        await apiRequest(`/questions/${questionForm.id}`, { method: "PUT", body: payload, token });
        setMessage("Question updated.");
      } else {
        await apiRequest("/questions", { method: "POST", body: payload, token });
        setMessage("Question created.");
      }
      setQuestionForm(emptyQuestion);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitQuiz = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const payload = {
      title: quizForm.title,
      description: quizForm.description,
      questions: quizForm.questions,
    };

    try {
      if (quizForm.id) {
        await apiRequest(`/quizzes/${quizForm.id}`, { method: "PUT", body: payload, token });
        setMessage("Quiz updated.");
      } else {
        await apiRequest("/quizzes", { method: "POST", body: payload, token });
        setMessage("Quiz created.");
      }
      setQuizForm(emptyQuiz);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await apiRequest(`/questions/${questionId}`, { method: "DELETE", token });
      setMessage("Question deleted.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm("Delete this quiz?")) return;
    try {
      await apiRequest(`/quizzes/${quizId}`, { method: "DELETE", token });
      setMessage("Quiz deleted.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const editQuestion = (question) => {
    setQuestionForm({
      id: question._id,
      text: question.text,
      options: [...question.options, "", "", "", ""].slice(0, Math.max(question.options.length, 4)),
      keywordsText: (question.keywords || []).join(", "),
      correctAnswerIndex: question.correctAnswerIndex,
    });
  };

  const updateQuestionOption = (index, value) => {
    setQuestionForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => (optionIndex === index ? value : option)),
    }));
  };

  const addQuestionOption = () => {
    setQuestionForm((current) => ({
      ...current,
      options: [...current.options, ""],
    }));
  };

  const removeQuestionOption = (index) => {
    setQuestionForm((current) => {
      if (current.options.length <= 2) {
        return current;
      }

      const options = current.options.filter((_option, optionIndex) => optionIndex !== index);
      const correctAnswerIndex = Math.min(
        Number.parseInt(current.correctAnswerIndex, 10) || 0,
        Math.max(options.length - 1, 0)
      );

      return {
        ...current,
        options,
        correctAnswerIndex,
      };
    });
  };

  const editQuiz = (quiz) => {
    setQuizForm({
      id: quiz._id,
      title: quiz.title,
      description: quiz.description || "",
      questions: (quiz.questions || []).map((question) => question._id || question),
    });
  };

  const toggleQuizQuestion = (questionId) => {
    setQuizForm((current) => {
      const exists = current.questions.includes(questionId);
      return {
        ...current,
        questions: exists
          ? current.questions.filter((id) => id !== questionId)
          : [...current.questions, questionId],
      };
    });
  };

  return (
    <section className="admin-dashboard">
      <div className="admin-status-row">
        {loading && <span className="text-secondary">Loading...</span>}
        <button className="btn btn-outline-primary btn-sm" type="button" onClick={loadData} disabled={loading}>
          Refresh
        </button>
      </div>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <section className="admin-section" id="questions">
        <h1 className="section-heading">Questions</h1>
        <div className="assignment-card admin-form-card">
          <form onSubmit={submitQuestion}>
            <div className="row g-3 align-items-start mb-3">
              <label className="col-md-2 col-form-label" htmlFor="questionText">
                Question Text:
              </label>
              <div className="col-md-10">
                <textarea
                  className="form-control"
                  id="questionText"
                  rows="2"
                  value={questionForm.text}
                  onChange={(event) => setQuestionForm({ ...questionForm, text: event.target.value })}
                  required
                />
              </div>
            </div>
            <div className="row g-3 align-items-start mb-3">
              <label className="col-md-2 col-form-label">Options:</label>
              <div className="col-md-10 vstack gap-2">
                {questionForm.options.map((option, index) => (
                  <div className="d-flex gap-2" key={`question-option-${index}`}>
                    <input
                      className="form-control"
                      value={option}
                      onChange={(event) => updateQuestionOption(index, event.target.value)}
                      required={index < 2}
                    />
                    {questionForm.options.length > 2 && (
                      <button className="btn btn-outline-danger" type="button" onClick={() => removeQuestionOption(index)} aria-label={`Remove option ${index + 1}`}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button className="btn btn-outline-primary align-self-start" type="button" onClick={addQuestionOption}>
                  Add option
                </button>
              </div>
            </div>
            <div className="row g-3 align-items-center mb-3">
              <label className="col-md-2 col-form-label" htmlFor="questionKeywords">
                Keywords:
              </label>
              <div className="col-md-10">
                <input
                  className="form-control"
                  id="questionKeywords"
                  value={questionForm.keywordsText}
                  onChange={(event) => setQuestionForm({ ...questionForm, keywordsText: event.target.value })}
                />
              </div>
            </div>
            <div className="row g-3 align-items-center mb-4">
              <label className="col-md-2 col-form-label" htmlFor="correctAnswerIndex">
                Correct Answer Index:
              </label>
              <div className="col-md-10">
                <input
                  id="correctAnswerIndex"
                  className="form-control"
                  type="number"
                  min="0"
                  max={Math.max(questionForm.options.length - 1, 0)}
                  value={questionForm.correctAnswerIndex}
                  onChange={(event) => setQuestionForm({ ...questionForm, correctAnswerIndex: event.target.value })}
                  required
                />
              </div>
            </div>
            <div className="d-grid gap-2">
              <button className="btn btn-primary" type="submit">
                {questionForm.id ? "Update Question" : "Add Question"}
              </button>
              {questionForm.id && (
                <button className="btn btn-outline-secondary" type="button" onClick={() => setQuestionForm(emptyQuestion)}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="assignment-record-list">
          {questions.map((question) => (
            <article className="assignment-record" key={question._id}>
              <h2>{question.text}</h2>
              <ul>
                {question.options.map((option, index) => (
                  <li key={`${question._id}-${index}`}>{option}</li>
                ))}
              </ul>
              <div className="record-actions">
                <button className="btn btn-warning" type="button" onClick={() => editQuestion(question)}>
                  Edit
                </button>
                <button className="btn btn-danger" type="button" onClick={() => deleteQuestion(question._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section" id="quizzes">
        <h1 className="section-heading">Quizzes</h1>
        <div className="assignment-card admin-form-card">
          <form onSubmit={submitQuiz}>
            <div className="row g-3 align-items-center mb-3">
              <label className="col-md-2 col-form-label" htmlFor="quizTitle">
                Quiz Title:
              </label>
              <div className="col-md-10">
                <input
                  className="form-control"
                  id="quizTitle"
                  value={quizForm.title}
                  onChange={(event) => setQuizForm({ ...quizForm, title: event.target.value })}
                  required
                />
              </div>
            </div>
            <div className="row g-3 align-items-start mb-3">
              <label className="col-md-2 col-form-label" htmlFor="quizDescription">
                Description:
              </label>
              <div className="col-md-10">
                <textarea
                  className="form-control"
                  id="quizDescription"
                  rows="2"
                  value={quizForm.description}
                  onChange={(event) => setQuizForm({ ...quizForm, description: event.target.value })}
                />
              </div>
            </div>
            <div className="row g-3 align-items-start mb-4">
              <label className="col-md-2 col-form-label">Questions:</label>
              <div className="col-md-10 question-picker">
                {questions.map((question) => (
                  <label className="form-check" key={question._id}>
                    <input className="form-check-input" type="checkbox" checked={quizForm.questions.includes(question._id)} onChange={() => toggleQuizQuestion(question._id)} />
                    <span className="form-check-label">{question.text}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="d-grid gap-2">
              <button className="btn btn-primary" type="submit">
                {quizForm.id ? "Update Quiz" : "Add Quiz"}
              </button>
              {quizForm.id && (
                <button className="btn btn-outline-secondary" type="button" onClick={() => setQuizForm(emptyQuiz)}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="assignment-record-list">
          {quizzes.map((quiz) => (
            <article className="assignment-record" key={quiz._id}>
              <h2>{quiz.title}</h2>
              <p>{quiz.description}</p>
              <span className="text-secondary">{quiz.questions?.length || 0} questions</span>
              <div className="record-actions">
                <button className="btn btn-warning" type="button" onClick={() => editQuiz(quiz)}>
                  Edit
                </button>
                <button className="btn btn-danger" type="button" onClick={() => deleteQuiz(quiz._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default AdminPage;
