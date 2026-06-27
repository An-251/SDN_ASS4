import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children, requireAdmin = false }) {
  const { token, user } = useSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user.admin) {
    return <Navigate to="/quizzes" replace />;
  }

  return children;
}

export default ProtectedRoute;
