import { Navigate, useLocation } from "react-router-dom";
import { Fragment } from "react";
import PropTypes from "prop-types";

function RouteGuard({
  authenticated,
  user,
  element,
  requiredRole,
  requiresApproved = false,
}) {
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

  if (requiresApproved && user?.approved === false) {
    return <Navigate to="/home" replace />;
  }

  if (location.pathname.startsWith("/admin") && user?.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <Fragment>{element}</Fragment>;
}

export default RouteGuard;

RouteGuard.propTypes = {
  authenticated: PropTypes.bool,
  user: PropTypes.shape({
    role: PropTypes.string,
    mustChangePassword: PropTypes.bool,
    approved: PropTypes.bool,
  }),
  element: PropTypes.element.isRequired,
  requiredRole: PropTypes.string,
  requiresApproved: PropTypes.bool,
};
