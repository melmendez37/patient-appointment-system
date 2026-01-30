import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardLayout from "./pages/dashboard/DashboardLayout.jsx";
import ViewAppointments from "./pages/dashboard/ViewAppointments.jsx";
import ViewSchedules from "./pages/dashboard/ViewSchedules.jsx";
import ViewProfile from "./pages/dashboard/ViewProfile.jsx";
import "react-datepicker/dist/react-datepicker.css";
import { useAuthContext } from "./hooks/useAuthContext.jsx";

const App = () => {
  const ProtectedDashboard = ({ children }) => {
    const { user, authReady } = useAuthContext();
    if(!authReady) return null;

    if (!user) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedDashboard>
            <DashboardLayout />
          </ProtectedDashboard>
        }
      >
        <Route path="appointments" element={<ViewAppointments />} />
        <Route path="schedules" element={<ViewSchedules />} />
        <Route path="profile" element={<ViewProfile />} />
      </Route>
    </Routes>
  );
};

export default App;
