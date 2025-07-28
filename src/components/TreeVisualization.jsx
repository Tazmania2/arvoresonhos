import React, { useState, useMemo } from 'react';
import Tree from 'react-d3-tree';
import './TreeVisualization.css';

const TreeVisualization = ({ clientes, playerStats }) => {
    const [selectedNode, setSelectedNode] = useState(null);

    // Converter dados dos clientes para formato da árvore
    const treeData = useMemo(() => {
        if (!clientes || clientes.length === 0) {
            return {
                name: 'Árvore dos Sonhos',
                children: []
            };
        }

        // Criar estrutura de árvore
        const root = {
            name: '🌳 Árvore dos Sonhos',
            attributes: {
                'Nível Médio': playerStats?.avg_level || 'N/A',
                'Humor Médio': playerStats?.avg_mood || 'N/A'
            },
            children: clientes.map(cliente => ({
                name: cliente.nome_cliente || `Cliente ${cliente.cliente_id}`,
                attributes: {
                    'Nível': cliente.nivel,
                    'Humor': cliente.humor,
                    'Última Interação': new Date(cliente.data_ultima_interacao).toLocaleDateString('pt-BR'),
                    'Risco': cliente.risco_cancelamento ? 'Alto' : 'Baixo'
                },
                nodeDatum: {
                    cliente_id: cliente.cliente_id,
                    nivel: cliente.nivel,
                    humor: cliente.humor,
                    isActive: cliente.nivel >= 8 && cliente.humor >= 2
                }
            }))
        };

        return root;
    }, [clientes, playerStats]);

    // Configurações da árvore
    const treeConfig = {
        orientation: 'vertical',
        translate: { x: 400, y: 50 },
        separation: { siblings: 2, nonSiblings: 2.5 },
        nodeSize: { x: 200, y: 100 }
    };

    // Estilo personalizado para os nós
    const renderCustomNode = ({ nodeDatum, toggleNode, foreignObjectProps }) => {
        const isActive = nodeDatum?.isActive;
        const humor = nodeDatum?.humor;
        const nivel = nodeDatum?.nivel;

        // Cores baseadas no humor
        const getHumorColor = (humor) => {
            switch (humor) {
                case 1: return '#e53e3e'; // vermelho
                case 2: return '#d69e2e'; // amarelo
                case 3: return '#3182ce'; // azul
                case 4: return '#38a169'; // verde
                default: return '#718096'; // cinza
            }
        };

        // Tamanho baseado no nível
        const getNodeSize = (nivel) => {
            if (nivel >= 10) return 60;
            if (nivel >= 8) return 50;
            if (nivel >= 6) return 40;
            return 30;
        };

        return (
            <g>
                <circle
                    r={getNodeSize(nivel)}
                    fill={getHumorColor(humor)}
                    stroke={isActive ? '#f6ad55' : '#2d3748'}
                    strokeWidth={isActive ? 3 : 2}
                    className="tree-node"
                />
                {isActive && (
                    <circle
                        r={getNodeSize(nivel) + 8}
                        fill="none"
                        stroke="#f6ad55"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        className="active-pulse"
                    />
                )}
                <foreignObject {...foreignObjectProps}>
                    <div className="node-content">
                        <div className="node-name">{nodeDatum.name}</div>
                        {nodeDatum.attributes && (
                            <div className="node-attributes">
                                <div>Nível: {nodeDatum.attributes['Nível']}</div>
                                <div>Humor: {nodeDatum.attributes['Humor']}</div>
                                {isActive && (
                                    <div className="active-indicator">
                                        ⭐ Gerando pontos
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </foreignObject>
            </g>
        );
    };

    // Handler para clique nos nós
    const handleNodeClick = (nodeDatum) => {
        setSelectedNode(nodeDatum);
        console.log('Cliente selecionado:', nodeDatum);
    };

    return (
        <div className="tree-visualization">
            <div className="tree-container">
                <Tree
                    data={treeData}
                    orientation="vertical"
                    translate={treeConfig.translate}
                    separation={treeConfig.separation}
                    nodeSize={treeConfig.nodeSize}
                    renderCustomNodeElement={renderCustomNode}
                    onNodeClick={handleNodeClick}
                    zoom={0.8}
                    scaleExtent={{ min: 0.5, max: 2 }}
                    enableLegacyTransitions={false}
                    pathFunc="step"
                    collapsible={false}
                    shouldCollapseNeighborNodes={false}
                />
            </div>

            {/* Painel de detalhes do cliente selecionado */}
            {selectedNode && (
                <div className="client-details-panel">
                    <div className="panel-header">
                        <h3>📋 Detalhes do Cliente</h3>
                        <button 
                            className="close-button"
                            onClick={() => setSelectedNode(null)}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="panel-content">
                        <div className="detail-item">
                            <strong>Nome:</strong> {selectedNode.name}
                        </div>
                        <div className="detail-item">
                            <strong>ID:</strong> {selectedNode.cliente_id}
                        </div>
                        <div className="detail-item">
                            <strong>Nível:</strong> {selectedNode.nivel}/10
                        </div>
                        <div className="detail-item">
                            <strong>Humor:</strong> {selectedNode.humor}/4
                        </div>
                        <div className="detail-item">
                            <strong>Status:</strong> 
                            <span className={selectedNode.isActive ? 'status-active' : 'status-inactive'}>
                                {selectedNode.isActive ? '✅ Ativo' : '❌ Inativo'}
                            </span>
                        </div>
                        {selectedNode.isActive && (
                            <div className="points-info">
                                <strong>Pontos gerados:</strong>
                                <div className="points-calculation">
                                    {selectedNode.nivel >= 10 ? 3 : selectedNode.nivel >= 9 ? 2 : 1} ponto(s)
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Controles de zoom */}
            <div className="tree-controls">
                <div className="control-info">
                    <p>🖱️ Use o mouse para navegar na árvore</p>
                    <p>🔍 Scroll para zoom in/out</p>
                    <p>👆 Clique nos galhos para ver detalhes</p>
                </div>
            </div>
        </div>
    );
};

export default TreeVisualization; 