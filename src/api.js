import axios from 'axios';

// Configuration
const FUNIFIER_SERVICE_URL = 'https://service2.funifier.com/v3';
const BASIC_AUTH = 'Basic NjdlNTZhOTgyMzI3Zjc0ZjNhMmViNjE5OjY3ZWM0ZTRhMjMyN2Y3NGYzYTJmOTZmNQ==';

// API service class
class FunifierAPI {
    constructor() {
        this.accessToken = localStorage.getItem('accessToken');
        this.playerId = localStorage.getItem('playerId');
    }

    // Set authentication tokens
    setAuth(accessToken, playerId) {
        this.accessToken = accessToken;
        this.playerId = playerId;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('playerId', playerId);
    }

    // Clear authentication
    clearAuth() {
        this.accessToken = null;
        this.playerId = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('playerId');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!(this.accessToken && this.playerId);
    }

    // Login function (corrigido)
    async login(email, password) {
        try {
            const response = await axios.post(`${FUNIFIER_SERVICE_URL}/auth/basic`, {
                email,
                password
            });

            const { playerId, accessToken } = response.data;
            this.setAuth(accessToken, playerId);

            return {
                success: true,
                playerId,
                accessToken
            };
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro no login. Verifique suas credenciais.'
            };
        }
    }

    // Get player status with Bearer token
    async getPlayerStatus() {
        if (!this.accessToken) {
            throw new Error('No access token available');
        }

        try {
            const response = await axios.get(`${FUNIFIER_SERVICE_URL}/status/player/me`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get player status error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao buscar dados do jogador.'
            };
        }
    }

    // Get clientes do jogador with Basic token
    async getClientes() {
        if (!this.playerId) {
            throw new Error('No player ID available');
        }

        try {
            const response = await axios.get(`${FUNIFIER_SERVICE_URL}/database/cliente_jogador?playerId=${this.playerId}`, {
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
            console.error('Get clientes error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao buscar clientes.'
            };
        }
    }

    // Get virtual goods details with Basic token
    async getVirtualGoodDetails(id) {
        try {
            const response = await axios.get(`${FUNIFIER_SERVICE_URL}/virtualgoods/item/${id}`, {
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
            console.error('Get virtual good details error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao buscar detalhes da medalha.'
            };
        }
    }

    // Get all virtual goods for medals
    async getMedalhas() {
        const medalTypes = ['progresso', 'estrela', 'relacionamento', 'excelencia'];
        const medalLevels = ['ouro', 'prata', 'bronze'];
        const medals = [];

        for (const type of medalTypes) {
            for (const level of medalLevels) {
                const medalId = `medalha_${type}_${level}`;
                try {
                    const result = await this.getVirtualGoodDetails(medalId);
                    if (result.success) {
                        medals.push(result.data);
                    }
                } catch (error) {
                    console.warn(`Medalha ${medalId} não encontrada`);
                }
            }
        }

        return {
            success: true,
            data: medals
        };
    }
}

// Create and export a single instance
const api = new FunifierAPI();
export default api; 