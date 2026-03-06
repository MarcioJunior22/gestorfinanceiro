import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export const Login: React.FC = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const { login, register } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isRegister) {
            if (!name || !email || !password) return setError('Preencha todos os campos');
            const success = register(name, email, password);
            if (!success) setError('E-mail já cadastrado');
        } else {
            const success = login(email, password);
            if (!success) setError('E-mail ou senha inválidos');
        }
    };

    return (
        <div className="flex items-center justify-center w-full" style={{ minHeight: '80vh' }}>
            <div className="glass-panel p-6 animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center mb-4">
                    {isRegister ? 'Criar Conta' : 'Acessar GestorPro'}
                </h2>

                <form onSubmit={handleSubmit} className="flex-col gap-4">
                    {isRegister && (
                        <div>
                            <label className="input-label">Nome</label>
                            <input
                                type="text"
                                className="input-field"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Seu nome"
                            />
                        </div>
                    )}

                    <div>
                        <label className="input-label">E-mail</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label className="input-label">Senha</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p style={{ color: 'var(--danger-color)', fontSize: '0.8rem' }}>{error}</p>}

                    <button type="submit" className="btn btn-primary w-full mt-4">
                        {isRegister ? <><UserPlus size={18} /> Cadastrar</> : <><LogIn size={18} /> Entrar</>}
                    </button>
                </form>

                <p className="text-center mt-4" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'} {' '}
                    <button
                        type="button"
                        onClick={() => setIsRegister(!isRegister)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600' }}
                    >
                        {isRegister ? 'Fazer Login' : 'Criar Agora'}
                    </button>
                </p>
            </div>
        </div>
    );
};
