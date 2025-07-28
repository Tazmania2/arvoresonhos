import React, { useState } from 'react';
import GestorAPI from '../../services/GestorAPI';
import './ExportButton.css';

const ExportButton = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleExport = async () => {
        setLoading(true);
        setMessage('');

        try {
            // Fetch all clientes
            const result = await GestorAPI.getAllClientes();
            
            if (!result.success) {
                setMessage(`❌ Erro: ${result.error}`);
                return;
            }

            // Export to Excel
            const exportResult = await GestorAPI.exportToExcel(result.data);
            
            if (exportResult.success) {
                setMessage(`✅ Exportado com sucesso: ${exportResult.fileName}`);
                
                // Save snapshot to localStorage for comparison
                localStorage.setItem('clientes_snapshot', JSON.stringify(result.data));
                localStorage.setItem('snapshot_date', new Date().toISOString());
            } else {
                setMessage(`❌ Erro na exportação: ${exportResult.error}`);
            }
        } catch (error) {
            setMessage(`❌ Erro inesperado: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="export-section">
            <h3>📊 Exportar Situação Atual</h3>
            <p>Baixe todos os clientes em formato Excel para análise e edição</p>
            
            <button 
                onClick={handleExport}
                disabled={loading}
                className="export-button"
            >
                {loading ? 'Exportando...' : '📥 Exportar Situação Atual'}
            </button>
            
            {message && (
                <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}
            
            <div className="export-info">
                <h4>📋 Campos incluídos na exportação:</h4>
                <ul>
                    <li><strong>playerId:</strong> ID do jogador</li>
                    <li><strong>cliente_id:</strong> ID do cliente</li>
                    <li><strong>nome_cliente:</strong> Nome do cliente</li>
                    <li><strong>nivel:</strong> Nível atual (1-10)</li>
                    <li><strong>humor:</strong> Humor atual (1-4)</li>
                    <li><strong>risco_cancelamento:</strong> Risco de cancelamento</li>
                    <li><strong>ultima_interacao:</strong> Data da última interação</li>
                </ul>
            </div>
        </div>
    );
};

export default ExportButton; 