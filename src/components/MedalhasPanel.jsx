import React from 'react';
import './MedalhasPanel.css';

const MedalhasPanel = ({ playerData, medalhas }) => {
    console.log('MedalhasPanel - playerData:', playerData);
    console.log('MedalhasPanel - catalog_items:', playerData?.catalog_items);
    
    const medalTypes = [
        { id: 'progresso', name: 'Progresso', icon: '📈' },
        { id: 'estrela', name: 'Estrela', icon: '⭐' },
        { id: 'relacionamento', name: 'Relacionamento', icon: '🤝' },
        { id: 'excelencia', name: 'Excelência', icon: '🏆' }
    ];

    const medalLevels = [
        { id: 'ouro', name: 'Ouro', color: '#ffd700', borderColor: '#b8860b' },
        { id: 'prata', name: 'Prata', color: '#c0c0c0', borderColor: '#a0a0a0' },
        { id: 'bronze', name: 'Bronze', color: '#cd7f32', borderColor: '#a0522d' }
    ];

    // Get player's inventory
    const playerInventory = playerData?.catalog_items || {};

    // Get medal state for a specific type
    const getMedalState = (type) => {
        for (const level of medalLevels) {
            const medalId = `medalha_${type}_${level.id}`;
            console.log(`Checking medal ${medalId}:`, playerInventory[medalId]);
            if (playerInventory[medalId] > 0) {
                console.log(`Found medal ${medalId} with quantity:`, playerInventory[medalId]);
                return level;
            }
        }
        console.log(`No medal found for type ${type}`);
        return null; // No medal
    };

    // Get medal description
    const getMedalDescription = (type, level) => {
        const descriptions = {
            progresso: {
                ouro: 'Conquistada por manter clientes com nível alto e humor positivo',
                prata: 'Recupere conquistando 2 clientes com nível 9+',
                bronze: 'Recupere conquistando 1 cliente com nível 8+'
            },
            estrela: {
                ouro: 'Conquistada por ter clientes com humor verde e nível 10',
                prata: 'Recupere melhorando humor de 2 clientes para verde',
                bronze: 'Recupere melhorando humor de 1 cliente para amarelo'
            },
            relacionamento: {
                ouro: 'Conquistada por manter relacionamentos duradouros',
                prata: 'Recupere interagindo com 3 clientes hoje',
                bronze: 'Recupere interagindo com 1 cliente hoje'
            },
            excelencia: {
                ouro: 'Conquistada por excelência em atendimento',
                prata: 'Recupere recebendo 2 elogios de clientes',
                bronze: 'Recupere recebendo 1 elogio de cliente'
            }
        };
        return descriptions[type]?.[level] || 'Descrição não disponível';
    };

    return (
        <div className="medalhas-panel">
            <h3>🏅 Medalhas</h3>
            <div className="medalhas-grid">
                {medalTypes.map(type => {
                    const medalState = getMedalState(type.id);
                    
                    return (
                        <div key={type.id} className="medalha-item">
                            <div className="medalha-header">
                                <span className="medalha-icon">{type.icon}</span>
                                <span className="medalha-name">{type.name}</span>
                            </div>
                            
                            <div className="medalha-status">
                                {medalState ? (
                                    <div 
                                        className="medalha-badge"
                                        style={{
                                            backgroundColor: medalState.color,
                                            borderColor: medalState.borderColor
                                        }}
                                        title={getMedalDescription(type.id, medalState.id)}
                                    >
                                        {medalState.name}
                                    </div>
                                ) : (
                                    <div 
                                        className="medalha-badge empty"
                                        title={getMedalDescription(type.id, 'bronze')}
                                    >
                                        Não conquistada
                                    </div>
                                )}
                            </div>

                            <div className="medalha-tooltip">
                                {medalState ? (
                                    <p>Você possui a medalha de {medalState.name.toLowerCase()}!</p>
                                ) : (
                                    <p>Complete desafios para conquistar esta medalha</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="medalhas-info">
                <h4>💡 Como funcionam as medalhas:</h4>
                <ul>
                    <li><strong>Ouro:</strong> Medalha máxima - concede bônus de multiplicador</li>
                    <li><strong>Prata:</strong> Medalha intermediária - recuperável com desafios</li>
                    <li><strong>Bronze:</strong> Medalha básica - primeiro passo</li>
                    <li><strong>Sem medalha:</strong> Complete desafios para começar</li>
                </ul>
            </div>
        </div>
    );
};

export default MedalhasPanel; 