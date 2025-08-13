import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadContract from './pages/UploadContract';
import ContractHistory from './pages/ContractHistory';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import AnalysisSummary from './pages/AnalysisSummary';
import LandVerification from './pages/LandVerification'; // New page
import VerificationResults from './pages/VerificationResults'; // New page

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard setIsAuthenticated={setIsAuthenticated} />
          </ProtectedRoute>
        } />
        
        <Route path="/upload" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <UploadContract setIsAuthenticated={setIsAuthenticated} />
          </ProtectedRoute>
        } />
        
        <Route path="/land-verification" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <LandVerification setIsAuthenticated={setIsAuthenticated} />
          </ProtectedRoute>
        } />
        
        <Route path="/verification-results/:id" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <VerificationResults setIsAuthenticated={setIsAuthenticated} />
          </ProtectedRoute>
        } />
        
        <Route path="/history" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ContractHistory setIsAuthenticated={setIsAuthenticated} />
          </ProtectedRoute>
        } />
        
        <Route path="/analysis/:id" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AnalysisSummary setIsAuthenticated={setIsAuthenticated} />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Settings setIsAuthenticated={setIsAuthenticated} />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
