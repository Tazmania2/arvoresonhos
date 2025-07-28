import React, { useState, useMemo } from 'react';
import Tree from 'react-d3-tree';
import './TreeVisualization.css';

const TreeVisualization = ({ clientes, playerStats }) => {
    const [selectedNode, setSelectedNode] = useState(null);

    // Converter dados dos clientes para formato da árvore orgânica
    const treeData = useMemo(() => {
        if (!clientes || clientes.length === 0) {
            return {
                name: '🌳 Árvore dos Sonhos',
                children: []
            };
        }

        // Agrupar clientes por nível para criar galhos naturais
        const clientesPorNivel = {
            alto: clientes.filter(c => c.nivel >= 8),
            medio: clientes.filter(c => c.nivel >= 5 && c.nivel < 8),
            baixo: clientes.filter(c => c.nivel < 5)
        };

        const root = {
            name: '🌳 Árvore dos Sonhos',
            attributes: {
                'Nível Médio': playerStats?.avg_level || 'N/A',
                'Humor Médio': playerStats?.avg_mood || 'N/A',
                'Clientes Ativos': clientes.filter(c => c.nivel >= 8 && c.humor >= 2).length
            },
            children: [
                // Galho dos clientes de alto nível
                {
                    name: '🌟 Clientes VIP',
                    attributes: {
                        'Quantidade': clientesPorNivel.alto.length,
                        'Ativos': clientesPorNivel.alto.filter(c => c.humor >= 2).length
                    },
                    children: clientesPorNivel.alto.map(cliente => ({
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
                            isActive: cliente.nivel >= 8 && cliente.humor >= 2,
                            data_ultima_interacao: cliente.data_ultima_interacao,
                            risco_cancelamento: cliente.risco_cancelamento
                        }
                    }))
                },
                // Galho dos clientes de nível médio
                {
                    name: '⭐ Clientes Regulares',
                    attributes: {
                        'Quantidade': clientesPorNivel.medio.length,
                        'Ativos': clientesPorNivel.medio.filter(c => c.humor >= 2).length
                    },
                    children: clientesPorNivel.medio.map(cliente => ({
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
                            isActive: cliente.nivel >= 8 && cliente.humor >= 2,
                            data_ultima_interacao: cliente.data_ultima_interacao,
                            risco_cancelamento: cliente.risco_cancelamento
                        }
                    }))
                },
                // Galho dos clientes de baixo nível
                {
                    name: '🌱 Clientes Novos',
                    attributes: {
                        'Quantidade': clientesPorNivel.baixo.length,
                        'Ativos': clientesPorNivel.baixo.filter(c => c.humor >= 2).length
                    },
                    children: clientesPorNivel.baixo.map(cliente => ({
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
                            isActive: cliente.nivel >= 8 && cliente.humor >= 2,
                            data_ultima_interacao: cliente.data_ultima_interacao,
                            risco_cancelamento: cliente.risco_cancelamento
                        }
                    }))
                }
            ]
        };

        return root;
    }, [clientes, playerStats]);

    // Configurações da árvore orgânica
    const treeConfig = {
        orientation: 'vertical',
        translate: { x: 400, y: 50 },
        separation: { siblings: 1.8, nonSiblings: 2.2 },
        nodeSize: { x: 180, y: 80 }
    };

    // Estilo personalizado para os nós com aparência orgânica
    const renderCustomNode = ({ nodeDatum, toggleNode, foreignObjectProps }) => {
        const isActive = nodeDatum?.isActive;
        const humor = nodeDatum?.humor;
        const nivel = nodeDatum?.nivel;
        const isRoot = nodeDatum.name.includes('Árvore dos Sonhos');
        const isCategory = nodeDatum.name.includes('Clientes');

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

        // Tamanho baseado no nível
        const getNodeSize = (nivel) => {
            if (nivel >= 10) return 35;
            if (nivel >= 8) return 30;
            if (nivel >= 6) return 25;
            return 20;
        };

        // Se for o nó raiz (árvore)
        if (isRoot) {
            return (
                <g>
                    <circle
                        r={45}
                        fill="#667eea"
                        stroke="#5a67d8"
                        strokeWidth={4}
                        className="tree-node root-node"
                    />
                    <foreignObject {...foreignObjectProps}>
                        <div className="node-content root-content">
                            <div className="node-name">🌳 Árvore dos Sonhos</div>
                            <div className="node-attributes">
                                <div>Nível: {nodeDatum.attributes['Nível Médio']}</div>
                                <div>Humor: {nodeDatum.attributes['Humor Médio']}</div>
                                <div>Ativos: {nodeDatum.attributes['Clientes Ativos']}</div>
                            </div>
                        </div>
                    </foreignObject>
                </g>
            );
        }

        // Se for uma categoria de clientes
        if (isCategory) {
            const categoryColor = nodeDatum.name.includes('VIP') ? '#f1c40f' : 
                                nodeDatum.name.includes('Regulares') ? '#3498db' : '#95a5a6';
            
            return (
                <g>
                    <circle
                        r={40}
                        fill={categoryColor}
                        stroke="#2c3e50"
                        strokeWidth={3}
                        className="tree-node category-node"
                    />
                    <foreignObject {...foreignObjectProps}>
                        <div className="node-content category-content">
                            <div className="node-name">{nodeDatum.name}</div>
                            <div className="node-attributes">
                                <div>Total: {nodeDatum.attributes['Quantidade']}</div>
                                <div>Ativos: {nodeDatum.attributes['Ativos']}</div>
                            </div>
                        </div>
                    </foreignObject>
                </g>
            );
        }

        // Nós dos clientes individuais
        return (
            <g>
                <circle
                    r={getNodeSize(nivel)}
                    fill={getHumorColor(humor)}
                    stroke={isActive ? '#f1c40f' : '#2c3e50'}
                    strokeWidth={isActive ? 4 : 2}
                    className="tree-node client-node"
                />
                {isActive && (
                    <circle
                        r={getNodeSize(nivel) + 8}
                        fill="none"
                        stroke="#f1c40f"
                        strokeWidth="3"
                        strokeDasharray="4,4"
                        className="active-pulse"
                    />
                )}
                <foreignObject {...foreignObjectProps}>
                    <div className="node-content client-content">
                        <div className="node-name">{nodeDatum.name}</div>
                        <div className="node-attributes">
                            <div>Nível: {nodeDatum.attributes['Nível']}</div>
                            <div>Humor: {nodeDatum.attributes['Humor']}</div>
                            {isActive && (
                                <div className="active-indicator">
                                    ⭐ Ativo
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
        if (nodeDatum.cliente_id) {
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
                    zoom={0.7}
                    scaleExtent={{ min: 0.4, max: 2.5 }}
                    enableLegacyTransitions={false}
                    pathFunc="step"
                    collapsible={true}
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
                            <strong>Última Interação:</strong> {new Date(selectedNode.data_ultima_interacao).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="detail-item">
                            <strong>Risco:</strong> 
                            <span className={selectedNode.risco_cancelamento ? 'status-inactive' : 'status-active'}>
                                {selectedNode.risco_cancelamento ? '🔴 Alto' : '🟢 Baixo'}
                            </span>
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
                    <p>🔍 Scroll para zoom (0.4x - 2.5x)</p>
                    <p>👆 Clique nos galhos para detalhes</p>
                    <p>🌿 Estrutura orgânica por nível</p>
                </div>
            </div>
        </div>
    );
};

export default TreeVisualization; 