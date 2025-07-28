import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import TreeRenderer from '../utils/treeRenderer';
import MedalhasPanel from './MedalhasPanel';
import './PlayerDashboard.css';

const PlayerDashboard = ({ onLogout }) => {
    const [playerData, setPlayerData] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [medalhas, setMedalhas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const treeContainerRef = useRef(null);
    const treeRendererRef = useRef(null);

    // Helper function to calculate gold medals and multiplier
    const calculateMultiplier = (catalogItems = {}) => {
        const goldMedals = Object.keys(catalogItems)
            .filter(key => key.includes('_ouro') && catalogItems[key] > 0)
            .reduce((total, key) => total + catalogItems[key], 0);
        const multiplier = goldMedals + 1;
        console.log('Gold medals found:', goldMedals, 'Multiplier:', multiplier);
        return { goldMedals, multiplier };
    };

    useEffect(() => {
        loadPlayerData();
    }, []);

    const loadPlayerData = async () => {
        setLoading(true);
        setError('');

        try {
            // Load player status
            const playerResult = await api.getPlayerStatus();
            if (!playerResult.success) {
                throw new Error(playerResult.error);
            }

            // Load clientes
            const clientesResult = await api.getClientes();
            if (!clientesResult.success) {
                throw new Error(clientesResult.error);
            }

            // Load medalhas
            const medalhasResult = await api.getMedalhas();
            if (!medalhasResult.success) {
                console.warn('Erro ao carregar medalhas:', medalhasResult.error);
            }

            setPlayerData(playerResult.data);
            setClientes(clientesResult.data);
            setMedalhas(medalhasResult.data || []);

        } catch (error) {
            console.error('Error loading player data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (clientes.length > 0 && treeContainerRef.current) {
            // Initialize tree renderer
            if (!treeRendererRef.current) {
                treeRendererRef.current = new TreeRenderer('#tree-container');
            }

            // Render tree
            const playerStats = {
                avg_level: playerData?.extra?.avg_level,
                avg_mood: playerData?.extra?.avg_mood,
                points: playerData?.total_points
            };
            
            console.log('Player Data:', playerData);
            console.log('Player Stats for Tree:', playerStats);
            
            treeRendererRef.current.render(clientes, playerStats);
        }
    }, [clientes, playerData]);

    const handleLogout = () => {
        api.clearAuth();
        onLogout();
    };

    const handleRefresh = () => {
        loadPlayerData();
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Carregando sua Árvore dos Sonhos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <h2>❌ Erro ao carregar dados</h2>
                <p>{error}</p>
                <button onClick={handleRefresh} className="retry-button">
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="player-dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>🌳 Árvore dos Sonhos</h1>
                    <div className="player-info">
                        <span>Bem-vindo, {playerData?.name || playerData?.email || 'Jogador'}!</span>
                        <button onClick={handleLogout} className="logout-button">
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="stats-panel">
                    <h3>📊 Seus Indicadores</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">Pontos Totais</span>
                            <span className="stat-value">{playerData?.total_points || '0'} 🎯</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Nível Médio</span>
                            <span className="stat-value">{playerData?.extra?.avg_level ? playerData.extra.avg_level.toFixed(1) : 'N/A'}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Humor Médio</span>
                            <span 
                                className="stat-value humor-indicator"
                                style={{
                                    backgroundColor: playerData?.extra?.avg_mood === 1 ? '#e53e3e' :
                                                  playerData?.extra?.avg_mood === 2 ? '#d69e2e' :
                                                  playerData?.extra?.avg_mood === 3 ? '#3182ce' :
                                                  playerData?.extra?.avg_mood === 4 ? '#38a169' : '#718096',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {playerData?.extra?.avg_mood ? playerData.extra.avg_mood.toFixed(1) : 'N/A'}
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Multiplicador</span>
                            <span className="stat-value">
                                {(() => {
                                    const { multiplier } = calculateMultiplier(playerData?.catalog_items);
                                    return `${multiplier.toFixed(1)}x`;
                                })()}
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Estrelas</span>
                            <span className="stat-value">{playerData?.extra?.stars || '0'} ⭐</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Nível Distintivo</span>
                            <span className="stat-value">{playerData?.extra?.distinctive_level || '1'}</span>
                        </div>
                    </div>
                </div>

                <div className="main-content">
                    <div className="tree-section">
                        <h3>👥 Sua Carteira de Clientes</h3>
                        <div className="tree-container">
                            <div id="tree-container" ref={treeContainerRef}></div>
                        </div>
                        <div className="tree-legend">
                            <div className="legend-item">
                                <span className="legend-color active"></span>
                                <span>Clientes Ativos (geram pontos)</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color inactive"></span>
                                <span>Clientes Inativos</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color fruit"></span>
                                <span>🍎 Frutas = Pontos Gerados</span>
                            </div>
                        </div>
                    </div>

                    <div className="side-panel">
                        <MedalhasPanel playerData={playerData} medalhas={medalhas} />
                        
                        <div className="points-panel">
                            <h3>🎯 Pontos e Status</h3>
                            <div className="points-info">
                                <p><strong>Pontos Totais:</strong> {playerData?.total_points || '0'}</p>
                                <p><strong>Medalhas de Ouro:</strong> {(() => {
                                    const { goldMedals } = calculateMultiplier(playerData?.catalog_items);
                                    return goldMedals;
                                })()}</p>
                                <p><strong>Multiplicador Ativo:</strong> {(() => {
                                    const { multiplier } = calculateMultiplier(playerData?.catalog_items);
                                    return `${multiplier.toFixed(1)}x`;
                                })()}</p>
                                <p><strong>Última Atualização:</strong> {playerData?.extra?.medal_expire_at ? new Date(playerData.extra.medal_expire_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                <p><strong>Status:</strong> {playerData?.extra?.at_risk ? '⚠️ Em Risco' : '✅ Seguro'}</p>
                                <p><strong>Clientes Bloqueados:</strong> {playerData?.extra?.blocked_clients?.length || '0'}</p>
                                <p>Pontos calculados automaticamente às 19h</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerDashboard; 