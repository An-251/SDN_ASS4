import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../store/authSlice.js";

function SignupPage() {
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    username: "",
    password: "",
    admin: false,
  });

  if (user) {
    return <Navigate to={user.admin ? "/admin" : "/quizzes"} replace />;
  }

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(signup(form));
  };

  return (
    <section className="auth-panel mx-auto">
      <h1 className="h3 mb-3">Sign up</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form className="vstack gap-3" onSubmit={handleSubmit}>
        <div>
          <label className="form-label" htmlFor="signup-username">
            Username
          </label>
          <input
            className="form-control"
            id="signup-username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="form-label" htmlFor="signup-password">
            Password
          </label>
          <input
            className="form-control"
            id="signup-password"
            name="password"
            type="password"
            minLength="6"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <label className="form-check">
          <input className="form-check-input" name="admin" type="checkbox" checked={form.admin} onChange={handleChange} />
          <span className="form-check-label">Create as admin account</span>
        </label>
        <button className="btn btn-primary" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Creating..." : "Create account"}
        </button>
      </form>
    </section>
  );
}

export default SignupPage;
