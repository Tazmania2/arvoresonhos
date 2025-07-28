import React, { useState, useRef } from 'react';
import GestorAPI from '../../services/GestorAPI';
import './ImportHandler.css';

const ImportHandler = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [changes, setChanges] = useState([]);
    const [showChanges, setShowChanges] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        setMessage('');
        setChanges([]);
        setShowChanges(false);

        try {
            let parsedData;
            
            // Parse file based on extension
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                parsedData = await GestorAPI.parseExcelFile(file);
            } else if (file.name.endsWith('.csv')) {
                parsedData = await GestorAPI.parseCSVFile(file);
            } else {
                setMessage('❌ Formato de arquivo não suportado. Use .xlsx, .xls ou .csv');
                return;
            }

            if (!parsedData.success) {
                setMessage(`❌ Erro ao processar arquivo: ${parsedData.error}`);
                return;
            }

            // Get old data from localStorage
            const oldData = JSON.parse(localStorage.getItem('clientes_snapshot') || '[]');
            
            // Detect changes
            const detectedChanges = GestorAPI.detectChanges(oldData, parsedData.data);
            
            if (detectedChanges.length === 0) {
                setMessage('ℹ️ Nenhuma mudança detectada no arquivo');
                return;
            }

            setChanges(detectedChanges);
            setShowChanges(true);
            setMessage(`✅ ${detectedChanges.length} mudanças detectadas. Revise e confirme.`);

        } catch (error) {
            setMessage(`❌ Erro ao processar arquivo: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmChanges = async () => {
        setLoading(true);
        setMessage('');

        try {
            let successCount = 0;
            let errorCount = 0;

            for (const change of changes) {
                try {
                    if (change.type === 'new_cliente') {
                        // Create new cliente
                        const result = await GestorAPI.createCliente(change.data);
                        if (result.success) {
                            successCount++;
                        } else {
                            errorCount++;
                        }
                    } else {
                        // Update existing cliente
                        const result = await GestorAPI.updateCliente(change.cliente);
                        if (result.success) {
                            // Trigger action
                            const actionResult = await GestorAPI.triggerAction(change.type, change.data);
                            if (actionResult.success) {
                                successCount++;
                            } else {
                                errorCount++;
                            }
                        } else {
                            errorCount++;
                        }
                    }
                } catch (error) {
                    errorCount++;
                }
            }

            if (errorCount === 0) {
                setMessage(`✅ ${successCount} mudanças aplicadas com sucesso!`);
                setChanges([]);
                setShowChanges(false);
            } else {
                setMessage(`⚠️ ${successCount} sucessos, ${errorCount} erros. Verifique os logs.`);
            }

        } catch (error) {
            setMessage(`❌ Erro ao aplicar mudanças: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getActionDescription = (change) => {
        const descriptions = {
            'cliente_subiu_nivel': `Cliente ${change.cliente.cliente_id} subiu do nível ${change.oldValue} para ${change.newValue}`,
            'cliente_desceu_nivel': `Cliente ${change.cliente.cliente_id} desceu do nível ${change.oldValue} para ${change.newValue}`,
            'humor_melhorou': `Cliente ${change.cliente.cliente_id} melhorou humor de ${change.oldValue} para ${change.newValue}`,
            'humor_piorou': `Cliente ${change.cliente.cliente_id} piorou humor de ${change.oldValue} para ${change.newValue}`,
            'alerta_vermelho': `Cliente ${change.cliente.cliente_id} entrou em risco de cancelamento`,
            'risco_resolvido': `Cliente ${change.cliente.cliente_id} saiu do risco de cancelamento`,
            'new_cliente': `Novo cliente: ${change.cliente.cliente_id}`
        };
        return descriptions[change.type] || change.type;
    };

    const getActionIcon = (change) => {
        const icons = {
            'cliente_subiu_nivel': '📈',
            'cliente_desceu_nivel': '📉',
            'humor_melhorou': '😊',
            'humor_piorou': '😞',
            'alerta_vermelho': '⚠️',
            'risco_resolvido': '✅',
            'new_cliente': '🆕'
        };
        return icons[change.type] || '🔄';
    };

    return (
        <div className="import-section">
            <h3>📤 Importar Dados Atualizados</h3>
            <p>Faça upload de uma planilha com dados atualizados dos clientes</p>
            
            <div className="file-upload-area">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".xlsx,.xls,.csv"
                    disabled={loading}
                    style={{ display: 'none' }}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="upload-button"
                >
                    {loading ? 'Processando...' : '📁 Selecionar Arquivo'}
                </button>
                <p className="file-info">Formatos aceitos: .xlsx, .xls, .csv</p>
            </div>
            
            {message && (
                <div className={`message ${message.includes('❌') ? 'error' : message.includes('⚠️') ? 'warning' : 'success'}`}>
                    {message}
                </div>
            )}
            
            {showChanges && changes.length > 0 && (
                <div className="changes-panel">
                    <h4>🔄 Mudanças Detectadas</h4>
                    <div className="changes-list">
                        {changes.map((change, index) => (
                            <div key={index} className="change-item">
                                <span className="change-icon">{getActionIcon(change)}</span>
                                <span className="change-description">{getActionDescription(change)}</span>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={handleConfirmChanges}
                        disabled={loading}
                        className="confirm-button"
                    >
                        {loading ? 'Aplicando...' : '✅ Confirmar Mudanças'}
                    </button>
                </div>
            )}
            
            <div className="import-info">
                <h4>📋 Instruções:</h4>
                <ol>
                    <li>Exporte a situação atual primeiro</li>
                    <li>Edite a planilha com as mudanças necessárias</li>
                    <li>Importe a planilha atualizada</li>
                    <li>Revise as mudanças detectadas</li>
                    <li>Confirme para aplicar as mudanças</li>
                </ol>
            </div>
        </div>
    );
};

export default ImportHandler; 