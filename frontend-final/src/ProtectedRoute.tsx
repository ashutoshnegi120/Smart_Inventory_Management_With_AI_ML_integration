// src/ProtectedRoute.tsx
import { ReactNode } from "react"; // Import ReactNode for typing
import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/auth-context";

interface ProtectedRouteProps {
  children: ReactNode; // Define the type for children
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth(); 

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>; // Return children wrapped in a fragment
};

export default ProtectedRoute;