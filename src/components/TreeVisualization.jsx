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

        // Criar estrutura de árvore mais compacta
        const root = {
            name: '🌳',
            attributes: {
                'Nível': playerStats?.avg_level || 'N/A',
                'Humor': playerStats?.avg_mood || 'N/A'
            },
            children: clientes.map(cliente => ({
                name: cliente.nome_cliente || `Cliente ${cliente.cliente_id}`,
                attributes: {
                    'Nível': cliente.nivel,
                    'Humor': cliente.humor
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

    // Configurações da árvore mais compacta
    const treeConfig = {
        orientation: 'vertical',
        translate: { x: 300, y: 30 },
        separation: { siblings: 1.2, nonSiblings: 1.5 },
        nodeSize: { x: 120, y: 60 }
    };

    // Estilo personalizado para os nós com cores vibrantes
    const renderCustomNode = ({ nodeDatum, toggleNode, foreignObjectProps }) => {
        const isActive = nodeDatum?.isActive;
        const humor = nodeDatum?.humor;
        const nivel = nodeDatum?.nivel;

        // Cores vibrantes baseadas no humor
        const getHumorColor = (humor) => {
            switch (humor) {
                case 1: return '#ff4757'; // vermelho vibrante
                case 2: return '#ffa502'; // laranja vibrante
                case 3: return '#3742fa'; // azul vibrante
                case 4: return '#2ed573'; // verde vibrante
                default: return '#747d8c'; // cinza
            }
        };

        // Tamanho baseado no nível (mais compacto)
        const getNodeSize = (nivel) => {
            if (nivel >= 10) return 25;
            if (nivel >= 8) return 22;
            if (nivel >= 6) return 18;
            return 15;
        };

        // Se for o nó raiz (árvore)
        if (nodeDatum.name === '🌳') {
            return (
                <g>
                    <circle
                        r={35}
                        fill="#667eea"
                        stroke="#5a67d8"
                        strokeWidth={3}
                        className="tree-node root-node"
                    />
                    <foreignObject {...foreignObjectProps}>
                        <div className="node-content root-content">
                            <div className="node-name">🌳</div>
                            <div className="node-attributes">
                                <div>Nível: {nodeDatum.attributes['Nível']}</div>
                                <div>Humor: {nodeDatum.attributes['Humor']}</div>
                            </div>
                        </div>
                    </foreignObject>
                </g>
            );
        }

        return (
            <g>
                <circle
                    r={getNodeSize(nivel)}
                    fill={getHumorColor(humor)}
                    stroke={isActive ? '#f1c40f' : '#2c3e50'}
                    strokeWidth={isActive ? 3 : 2}
                    className="tree-node"
                />
                {isActive && (
                    <circle
                        r={getNodeSize(nivel) + 5}
                        fill="none"
                        stroke="#f1c40f"
                        strokeWidth="2"
                        strokeDasharray="3,3"
                        className="active-pulse"
                    />
                )}
                <foreignObject {...foreignObjectProps}>
                    <div className="node-content">
                        <div className="node-name">{nodeDatum.name}</div>
                        <div className="node-attributes">
                            <div>Nível: {nodeDatum.attributes['Nível']}</div>
                            <div>Humor: {nodeDatum.attributes['Humor']}</div>
                            {isActive && (
                                <div className="active-indicator">
                                    ⭐
                                </div>
                            )}
                        </div>
                    </div>
                </foreignObject>
            </g>
        );
    };

    // Handler para clique nos nós
    const handleNodeClick = (nodeDatum) => {
        if (nodeDatum.name !== '🌳') {
            setSelectedNode(nodeDatum);
            console.log('Cliente selecionado:', nodeDatum);
        }
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
                    zoom={0.6}
                    scaleExtent={{ min: 0.3, max: 3 }}
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
                    <p>🖱️ Arraste para navegar</p>
                    <p>🔍 Scroll para zoom (0.3x - 3x)</p>
                    <p>👆 Clique nos galhos para detalhes</p>
                </div>
            </div>
        </div>
    );
};

export default TreeVisualization; 