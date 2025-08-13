import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/*" element={<App />} />
    </Routes>
  </Router>,
  document.getElementById('root')
);

// src/App.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import UploadContract from './pages/UploadContract';
import ContractHistory from './pages/ContractHistory';
import AnalysisSummary from './pages/AnalysisSummary';

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const lastVisitedPage = localStorage.getItem('lastVisitedPage');
    if (lastVisitedPage) {
      navigate(`/${lastVisitedPage}`); // Redirect to the last visited page
    }
  }, [navigate]);

  return (
    <div>
      <Navigation />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadContract />} />
        <Route path="/history" element={<ContractHistory />} />
        <Route path="/analysis-summary/:id" element={<AnalysisSummary />} />
      </Routes>
    </div>
  );
};

export default App;