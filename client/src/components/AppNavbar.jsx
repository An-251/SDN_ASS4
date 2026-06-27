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

  if (!user) {
    return null;
  }

  const homePath = user.admin ? "/admin" : "/quizzes";

  return (
    <header className="container dashboard-header">
      <div className="dashboard-title-row">
        <Link className="dashboard-title" to={homePath}>
          {user.admin ? "Admin Dashboard" : "Dashboard"}
        </Link>
        <span className="dashboard-welcome">Welcome, {user.username}</span>
      </div>
      <nav className="dashboard-menu" aria-label="Dashboard navigation">
        <NavLink className="dashboard-menu-link" to={homePath}>
          Home
        </NavLink>
        {user.admin ? (
          <>
            <a className="dashboard-menu-link" href="#questions">
              Manage Questions
            </a>
            <a className="dashboard-menu-link" href="#quizzes">
              Manage Quizzes
            </a>
          </>
        ) : (
          <>
            <NavLink className="dashboard-menu-link" to="/quizzes">
              Quiz
            </NavLink>
            <span className="dashboard-menu-link muted">Article</span>
          </>
        )}
        <button className="dashboard-menu-link logout-link" type="button" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
}

export default AppNavbar;
