import React, { useState } from 'react';
import api from '../api';
import './Login.css';

const Login = ({ onLoginSuccess, onGestorAccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await api.login(email, password);
            
            if (result.success) {
                onLoginSuccess();
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Erro de conexão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleGestorAccess = () => {
        onGestorAccess();
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>🌳 Árvore dos Sonhos</h1>
                    <p>Faça login para acessar sua gamificação</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="text"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Sua senha"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            ❌ {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className="gestor-access">
                    <div className="divider">
                        <span>ou</span>
                    </div>
                    <button 
                        onClick={handleGestorAccess}
                        className="gestor-button"
                        disabled={loading}
                    >
                        👨‍💼 Acessar como Gestor
                    </button>
                    <p className="gestor-info">
                        Acesso direto ao dashboard de gestão de clientes
                    </p>
                </div>

                <div className="login-footer">
                    <p>Use suas credenciais do Funifier</p>
                    <div className="demo-credentials">
                        <h4>Credenciais de Teste:</h4>
                        <p><strong>E-mail:</strong> joao@teste.com</p>
                        <p><strong>Senha:</strong> (use a senha configurada no Funifier)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 