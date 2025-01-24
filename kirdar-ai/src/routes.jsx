// src/routes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import HomePage from './components/features/Home/HomePage';
import Login from './components/features/Auth/Login';
import Register from './components/features/Auth/Register';
import Questionnaire from './components/features/Questionnaire/Questionnaire';
import ClientPersonas from './components/features/ClientPersonas/ClientPersonas';
import ScenarioChallenge from './components/features/ScenarioChallenge/ScenarioChallenge';
import Simulation from './components/features/ScenarioChallenge/Simulation';
import Management from './components/features/Management/Management';
import Dashboard from './components/features/Dashboard/Dashboard';
import UserSettings from './components/features/UserManagement/UserSettings';
import ProtectedRoute from './components/common/ProtectedRoute';
import { GuestEntry, GuestSelection } from './components/features/Guest/GuestMode';
import GuestSimulation from './components/features/Guest/GuestSimulation';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Guest Routes */}
      <Route path="/guest" element={<GuestEntry />} />
      <Route path="/guest/selection" element={<GuestSelection />} />
      <Route path="/guest/simulation" element={<GuestSimulation />} />

      {/* Protected Routes with Role-Based Access */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user?.isAdmin ? (
              <Navigate to="/management" replace />
            ) : (
              <Dashboard />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/management"
        element={
          <ProtectedRoute>
            {user?.isAdmin ? (
              <Management />
            ) : (
              <Navigate to="/dashboard" replace />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/questionnaire"
        element={
          <ProtectedRoute>
            <Questionnaire />
          </ProtectedRoute>
        }
      />

      {/* Admin-only routes */}
      <Route
        path="/client-personas"
        element={
          <ProtectedRoute>
            {user?.isAdmin ? (
              <ClientPersonas />
            ) : (
              <Navigate to="/dashboard" replace />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/scenario-challenge"
        element={
          <ProtectedRoute>
            {user?.isAdmin ? (
              <ScenarioChallenge />
            ) : (
              <Navigate to="/dashboard" replace />
            )}
          </ProtectedRoute>
        }
      />

      {/* Simulation route - accessible by all authenticated users */}
      <Route
        path="/simulation"
        element={
          <ProtectedRoute>
            <Simulation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <UserSettings />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route for 404s */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-black pt-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 mb-4">
                404 - Page Not Found
              </h1>
              <p className="text-gray-400 mb-8">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <button
                onClick={() => window.history.back()}
                className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-500 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;