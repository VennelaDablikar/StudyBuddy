// App.jsx — Root component with React Router setup
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import CoursePage from './pages/CoursePage';
import NotePage from './pages/NotePage';
import AnalyticsPage from './pages/AnalyticsPage';
import PlannerPage from './pages/PlannerPage';
import QuizPage from './pages/QuizPage';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="app-wrapper">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/courses/:id" element={
                <ProtectedRoute><CoursePage /></ProtectedRoute>
              } />
              <Route path="/courses/:id/notes/:noteId" element={
                <ProtectedRoute><NotePage /></ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute><AnalyticsPage /></ProtectedRoute>
              } />
              <Route path="/planner" element={
                <ProtectedRoute><PlannerPage /></ProtectedRoute>
              } />
              <Route path="/courses/:id/quiz" element={
                <ProtectedRoute><QuizPage /></ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
