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
    <section className="auth-panel mx-auto">
      <h1 className="h3 mb-2">Login</h1>
      <p className="text-secondary">Login first, then the React app fetches quizzes with Redux.</p>
      {error && <div className="alert alert-danger">{error}</div>}
      <form className="vstack gap-3" onSubmit={handleSubmit}>
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
      <p className="small mt-3 mb-0">
        Admin demo: <strong>admin4</strong> / <strong>123456</strong>. Need an account?{" "}
        <Link to="/signup">Sign up</Link>.
      </p>
    </section>
  );
}

export default LoginPage;
