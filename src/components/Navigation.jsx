import React from 'react';
import './Navigation.css';

const Navigation = ({ currentView, onViewChange }) => {
    return (
        <nav className="navigation">
            <div className="nav-container">
                <div className="nav-brand">
                    <h2>🌳 Árvore dos Sonhos</h2>
                </div>
                
                <div className="nav-tabs">
                    <button 
                        className={`nav-tab ${currentView === 'player' ? 'active' : ''}`}
                        onClick={() => onViewChange('player')}
                    >
                        🎮 Jogador
                    </button>
                    <button 
                        className={`nav-tab ${currentView === 'gestor' ? 'active' : ''}`}
                        onClick={() => onViewChange('gestor')}
                    >
                        👨‍💼 Gestor
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navigation; 