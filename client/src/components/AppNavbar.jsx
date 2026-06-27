import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice.js";

function AppNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          Assignment 4 Quiz
        </Link>
        <div className="d-flex align-items-center gap-3 ms-auto">
          {user ? (
            <>
              <NavLink className="nav-link" to="/quizzes">
                Quizzes
              </NavLink>
              {user.admin && (
                <NavLink className="nav-link" to="/admin">
                  Admin
                </NavLink>
              )}
              <span className="small text-secondary">
                {user.username} ({user.admin ? "admin" : "user"})
              </span>
              <button className="btn btn-outline-danger btn-sm" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink className="nav-link" to="/login">
                Login
              </NavLink>
              <NavLink className="btn btn-primary btn-sm" to="/signup">
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default AppNavbar;
