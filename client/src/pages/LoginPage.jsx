import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/authSlice.js";

function LoginPage() {
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    username: "user4",
    password: "123456",
  });

  if (user) {
    return <Navigate to={user.admin ? "/admin" : "/quizzes"} replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(login(form));
  };

  return (
    <section className="auth-panel">
      <h1 className="auth-title">Login</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form className="vstack gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="form-label" htmlFor="username">
            Username
          </label>
          <input
            className="form-control"
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            className="form-control"
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="auth-link-row mb-0">
        Don't have an account? <Link to="/signup">Register here</Link>
      </p>
      <p className="auth-demo mb-0">Demo: user4 / 123456, admin4 / 123456</p>
    </section>
  );
}

export default LoginPage;
