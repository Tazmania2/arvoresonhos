import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import PlayerDashboard from './components/PlayerDashboard';
import GestorDashboard from './components/gestor/GestorDashboard';
import Navigation from './components/Navigation';
import api from './api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('player');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      if (api.isAuthenticated()) {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleGestorAccess = () => {
    setIsAuthenticated(true);
    setCurrentView('gestor');
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Carregando Árvore dos Sonhos...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {isAuthenticated ? (
        <>
          <Navigation currentView={currentView} onViewChange={handleViewChange} />
          {currentView === 'player' ? (
            <PlayerDashboard onLogout={handleLogout} />
          ) : (
            <GestorDashboard />
          )}
        </>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} onGestorAccess={handleGestorAccess} />
      )}
    </div>
  );
}

export default App; 