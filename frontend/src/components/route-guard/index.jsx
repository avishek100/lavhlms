import { Navigate, useLocation } from "react-router-dom";
import { Fragment } from "react";
import PropTypes from "prop-types";

function RouteGuard({ authenticated, user, element, requiredRole }) {
  const location = useLocation();

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/home" replace />;
  }

  if (
    authenticated &&
    user?.role !== "admin" &&
    user?.role !== "instructor" &&
    (location.pathname.includes("instructor") ||
      location.pathname.includes("/auth") ||
      location.pathname === "/admin")
  ) {
    return <Navigate to="/home" replace />;
  }

  if (
    authenticated &&
    user.role === "instructor" &&
    location.pathname !== "/change-password" &&
    !location.pathname.includes("instructor") &&
    !location.pathname.includes("/auth")
  ) {
    return <Navigate to="/instructor" replace />;
  }

  return <Fragment>{element}</Fragment>;
}

export default RouteGuard;

RouteGuard.propTypes = {
  authenticated: PropTypes.bool,
  user: PropTypes.shape({
    role: PropTypes.string,
    mustChangePassword: PropTypes.bool,
  }),
  element: PropTypes.element.isRequired,
  requiredRole: PropTypes.string,
};
