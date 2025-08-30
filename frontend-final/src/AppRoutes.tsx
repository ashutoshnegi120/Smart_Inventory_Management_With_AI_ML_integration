// src/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/dashboard";
import Landingpage from "./LandingPage";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landingpage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;