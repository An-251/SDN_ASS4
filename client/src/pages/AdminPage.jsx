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
    <section>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Admin CRUD</h1>
          <p className="text-secondary mb-0">Admins can manage questions and quizzes. Normal users can only take quizzes.</p>
        </div>
        <button className="btn btn-outline-primary" type="button" onClick={loadData} disabled={loading}>
          Refresh
        </button>
      </div>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="admin-panel">
            <h2 className="h4">{questionForm.id ? "Edit Question" : "Create Question"}</h2>
            <form className="vstack gap-3" onSubmit={submitQuestion}>
              <textarea className="form-control" rows="2" placeholder="Question text" value={questionForm.text} onChange={(event) => setQuestionForm({ ...questionForm, text: event.target.value })} required />
              <div className="vstack gap-2">
                <label className="form-label mb-0">Options</label>
                {questionForm.options.map((option, index) => (
                  <div className="input-group" key={`question-option-${index}`}>
                    <span className="input-group-text">Option {index + 1}</span>
                    <input
                      className="form-control"
                      placeholder={`Answer option ${index + 1}`}
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
              <input className="form-control" placeholder="Keywords, comma separated" value={questionForm.keywordsText} onChange={(event) => setQuestionForm({ ...questionForm, keywordsText: event.target.value })} />
              <div>
                <label className="form-label" htmlFor="correctAnswerIndex">Correct Answer Index</label>
                <input id="correctAnswerIndex" className="form-control" type="number" min="0" max={Math.max(questionForm.options.length - 1, 0)} value={questionForm.correctAnswerIndex} onChange={(event) => setQuestionForm({ ...questionForm, correctAnswerIndex: event.target.value })} required />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" type="submit">{questionForm.id ? "Update question" : "Create question"}</button>
                {questionForm.id && <button className="btn btn-outline-secondary" type="button" onClick={() => setQuestionForm(emptyQuestion)}>Cancel</button>}
              </div>
            </form>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="admin-panel">
            <h2 className="h4">Questions</h2>
            <div className="table-responsive">
              <table className="table align-middle">
                <tbody>
                  {questions.map((question) => (
                    <tr key={question._id}>
                      <td>{question.text}</td>
                      <td>{question.options.length} options</td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary me-2" type="button" onClick={() => editQuestion(question)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => deleteQuestion(question._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-lg-5">
          <div className="admin-panel">
            <h2 className="h4">{quizForm.id ? "Edit Quiz" : "Create Quiz"}</h2>
            <form className="vstack gap-3" onSubmit={submitQuiz}>
              <input className="form-control" placeholder="Quiz title" value={quizForm.title} onChange={(event) => setQuizForm({ ...quizForm, title: event.target.value })} required />
              <textarea className="form-control" rows="2" placeholder="Description" value={quizForm.description} onChange={(event) => setQuizForm({ ...quizForm, description: event.target.value })} />
              <div className="question-picker border rounded p-2">
                {questions.map((question) => (
                  <label className="form-check" key={question._id}>
                    <input className="form-check-input" type="checkbox" checked={quizForm.questions.includes(question._id)} onChange={() => toggleQuizQuestion(question._id)} />
                    <span className="form-check-label">{question.text}</span>
                  </label>
                ))}
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" type="submit">{quizForm.id ? "Update quiz" : "Create quiz"}</button>
                {quizForm.id && <button className="btn btn-outline-secondary" type="button" onClick={() => setQuizForm(emptyQuiz)}>Cancel</button>}
              </div>
            </form>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="admin-panel">
            <h2 className="h4">Quizzes</h2>
            <div className="table-responsive">
              <table className="table align-middle">
                <tbody>
                  {quizzes.map((quiz) => (
                    <tr key={quiz._id}>
                      <td>
                        <strong>{quiz.title}</strong>
                        <div className="small text-secondary">{quiz.description}</div>
                      </td>
                      <td>{quiz.questions?.length || 0} questions</td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary me-2" type="button" onClick={() => editQuiz(quiz)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => deleteQuiz(quiz._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminPage;
