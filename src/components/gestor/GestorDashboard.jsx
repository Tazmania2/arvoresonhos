import React, { useState, useEffect } from 'react';
import ExportButton from './ExportButton';
import ImportHandler from './ImportHandler';
import './GestorDashboard.css';

const GestorDashboard = () => {
    const [stats, setStats] = useState({
        totalClientes: 0,
        totalJogadores: 0,
        clientesAtivos: 0,
        clientesEmRisco: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            // Simulate loading stats (in real app, this would come from API)
            setTimeout(() => {
                setStats({
                    totalClientes: 15,
                    totalJogadores: 5,
                    clientesAtivos: 12,
                    clientesEmRisco: 1
                });
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error loading stats:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="gestor-loading">
                <div className="loading-spinner"></div>
                <p>Carregando dashboard do gestor...</p>
            </div>
        );
    }

    return (
        <div className="gestor-dashboard">
            <header className="gestor-header">
                <div className="header-content">
                    <h1>👨‍💼 Dashboard do Gestor</h1>
                    <p>Gerencie os dados dos clientes e mantenha a gamificação atualizada</p>
                </div>
            </header>

            <div className="gestor-content">
                <div className="stats-overview">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalClientes}</span>
                            <span className="stat-label">Total de Clientes</span>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">🎮</div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalJogadores}</span>
                            <span className="stat-label">Jogadores Ativos</span>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.clientesAtivos}</span>
                            <span className="stat-label">Clientes Ativos</span>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.clientesEmRisco}</span>
                            <span className="stat-label">Em Risco</span>
                        </div>
                    </div>
                </div>

                <div className="main-actions">
                    <div className="action-section">
                        <ExportButton />
                    </div>
                    
                    <div className="action-section">
                        <ImportHandler />
                    </div>
                </div>

                <div className="info-panel">
                    <h3>📋 Sobre o Sistema</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <h4>🔄 Fluxo de Trabalho</h4>
                            <p>1. Exporte a situação atual dos clientes</p>
                            <p>2. Edite a planilha com as mudanças necessárias</p>
                            <p>3. Importe a planilha atualizada</p>
                            <p>4. Confirme as mudanças para aplicar</p>
                        </div>
                        
                        <div className="info-item">
                            <h4>🎯 Ações Automáticas</h4>
                            <p>• Mudanças de nível disparam ações de progresso</p>
                            <p>• Mudanças de humor disparam ações de relacionamento</p>
                            <p>• Clientes em risco disparam alertas</p>
                            <p>• Todas as ações alimentam a gamificação</p>
                        </div>
                        
                        <div className="info-item">
                            <h4>📊 Banco de Dados</h4>
                            <p>• Coleção: <strong>cliente_jogador</strong></p>
                            <p>• Campos: playerId, cliente_id, nivel, humor</p>
                            <p>• Atualizações em tempo real</p>
                            <p>• Sincronização com Funifier</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GestorDashboard; 