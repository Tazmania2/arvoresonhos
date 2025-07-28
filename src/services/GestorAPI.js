import axios from 'axios';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Configuration
const FUNIFIER_API_URL = 'https://api.funifier.com';
const FUNIFIER_SERVICE_URL = 'https://service2.funifier.com/v3';
const BASIC_AUTH = 'Basic NjdlNTZhOTgyMzI3Zjc0ZjNhMmViNjE5OjY3ZWM0ZTRhMjMyN2Y3NGYzYTJmOTZmNQ==';

// Headers for all requests
const headers = {
    'Authorization': BASIC_AUTH,
    'Content-Type': 'application/json'
};

class GestorAPI {
    // Get all clientes from the database
    async getAllClientes() {
        try {
            const response = await axios.get(`${FUNIFIER_SERVICE_URL}/database/cliente_jogador`, {
                headers
            });
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching clientes:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao buscar clientes'
            };
        }
    }

    // Get clientes by playerId
    async getClientesByPlayer(playerId) {
        try {
            const response = await axios.get(`${FUNIFIER_SERVICE_URL}/database/cliente_jogador?playerId=${playerId}`, {
                headers
            });
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching clientes by player:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao buscar clientes do jogador'
            };
        }
    }

    // Update cliente in database
    async updateCliente(clienteData) {
        try {
            const response = await axios.put(`${FUNIFIER_SERVICE_URL}/database/cliente_jogador/${clienteData._id}`, clienteData, {
                headers
            });
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error updating cliente:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao atualizar cliente'
            };
        }
    }

    // Create new cliente
    async createCliente(clienteData) {
        try {
            const response = await axios.post(`${FUNIFIER_SERVICE_URL}/database/cliente_jogador`, clienteData, {
                headers
            });
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error creating cliente:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao criar cliente'
            };
        }
    }

    // Trigger action in Funifier
    async triggerAction(actionId, actionData) {
        try {
            const response = await axios.post(`${FUNIFIER_API_URL}/action/${actionId}`, actionData, {
                headers: {
                    'Authorization': BASIC_AUTH,
                    'Content-Type': 'application/json'
                }
            });
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error triggering action:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao disparar ação'
            };
        }
    }

    // Export clientes to Excel
    async exportToExcel(clientes) {
        try {
            const workbook = XLSX.utils.book_new();
            
            // Prepare data for Excel
            const excelData = clientes.map(cliente => ({
                playerId: cliente.playerId,
                cliente_id: cliente.cliente_id,
                nome_cliente: cliente.nome_cliente || cliente.cliente_id,
                nivel: cliente.nivel,
                humor: cliente.humor,
                risco_cancelamento: cliente.risco_cancelamento || false,
                ultima_interacao: cliente.data_ultima_interacao || new Date().toISOString()
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
            
            // Generate file
            const fileName = `clientes_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            return {
                success: true,
                fileName
            };
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            return {
                success: false,
                error: 'Erro ao exportar planilha'
            };
        }
    }

    // Parse Excel file
    parseExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    
                    resolve({
                        success: true,
                        data: jsonData
                    });
                } catch (error) {
                    reject({
                        success: false,
                        error: 'Erro ao processar arquivo Excel'
                    });
                }
            };
            
            reader.onerror = () => {
                reject({
                    success: false,
                    error: 'Erro ao ler arquivo'
                });
            };
            
            reader.readAsArrayBuffer(file);
        });
    }

    // Parse CSV file
    parseCSVFile(file) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        reject({
                            success: false,
                            error: 'Erro ao processar arquivo CSV'
                        });
                    } else {
                        resolve({
                            success: true,
                            data: results.data
                        });
                    }
                },
                error: (error) => {
                    reject({
                        success: false,
                        error: 'Erro ao ler arquivo CSV'
                    });
                }
            });
        });
    }

    // Compare old and new data to detect changes
    detectChanges(oldData, newData) {
        const changes = [];
        
        newData.forEach(newCliente => {
            const oldCliente = oldData.find(old => 
                old.playerId === newCliente.playerId && 
                old.cliente_id === newCliente.cliente_id
            );
            
            if (oldCliente) {
                // Check for changes
                if (newCliente.nivel > oldCliente.nivel) {
                    changes.push({
                        type: 'cliente_subiu_nivel',
                        cliente: newCliente,
                        oldValue: oldCliente.nivel,
                        newValue: newCliente.nivel,
                        data: {
                            cliente_id: newCliente.cliente_id,
                            diferenca: newCliente.nivel - oldCliente.nivel
                        }
                    });
                } else if (newCliente.nivel < oldCliente.nivel) {
                    changes.push({
                        type: 'cliente_desceu_nivel',
                        cliente: newCliente,
                        oldValue: oldCliente.nivel,
                        newValue: newCliente.nivel,
                        data: {
                            cliente_id: newCliente.cliente_id,
                            diferenca: oldCliente.nivel - newCliente.nivel
                        }
                    });
                }
                
                if (newCliente.humor > oldCliente.humor) {
                    changes.push({
                        type: 'humor_melhorou',
                        cliente: newCliente,
                        oldValue: oldCliente.humor,
                        newValue: newCliente.humor,
                        data: {
                            cliente_id: newCliente.cliente_id,
                            de: oldCliente.humor,
                            para: newCliente.humor
                        }
                    });
                } else if (newCliente.humor < oldCliente.humor) {
                    changes.push({
                        type: 'humor_piorou',
                        cliente: newCliente,
                        oldValue: oldCliente.humor,
                        newValue: newCliente.humor,
                        data: {
                            cliente_id: newCliente.cliente_id,
                            de: oldCliente.humor,
                            para: newCliente.humor
                        }
                    });
                }
                
                // Check risk changes
                const oldRisk = oldCliente.risco_cancelamento || false;
                const newRisk = newCliente.risco_cancelamento || false;
                
                if (!oldRisk && newRisk) {
                    changes.push({
                        type: 'alerta_vermelho',
                        cliente: newCliente,
                        data: {}
                    });
                } else if (oldRisk && !newRisk) {
                    changes.push({
                        type: 'risco_resolvido',
                        cliente: newCliente,
                        data: {}
                    });
                }
            } else {
                // New cliente
                changes.push({
                    type: 'new_cliente',
                    cliente: newCliente,
                    data: newCliente
                });
            }
        });
        
        return changes;
    }
}

export default new GestorAPI(); 