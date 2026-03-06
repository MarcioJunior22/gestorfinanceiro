import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, ShieldCheck, PieChart, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const { login, register, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isRegister) {
            if (!name || !email || !password) return setError('Preencha todos os campos');
            const success = register(name, email, password);
            if (!success) setError('E-mail já cadastrado');
            else navigate('/');
        } else {
            const success = login(email, password);
            if (!success) setError('E-mail ou senha inválidos');
            else navigate('/');
        }
    };

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden relative">
            {/* BACKGROUND DECORATION */}
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />

            {/* LEFT SIDE - BRANDING (HIDDEN ON MOBILE) */}
            <div className="hidden lg:flex flex-col justify-center p-20 w-1/2 relative z-10">
                <div className="flex items-center gap-3 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-primary text-white p-3 rounded-2xl shadow-glow">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter">GestorPro</h1>
                </div>

                <h2 className="text-5xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    Sua jornada para a <br />
                    <span className="text-primary italic">liberdade financeira</span> <br />
                    começa aqui.
                </h2>

                <p className="text-xl text-muted mb-12 max-w-md animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    Uma plataforma robusta, elegante e inteligente para gerenciar cada centavo do seu dinheiro.
                </p>

                <div className="flex flex-col gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    {[
                        { icon: <PieChart className="text-primary" />, text: "Relatórios visuais e intuitivos" },
                        { icon: <ShieldCheck className="text-secondary" />, text: "Segurança total dos seus dados" },
                        { icon: <Sparkles className="text-warning" />, text: "Insights inteligentes automatizados" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 bg-surface/50 p-4 rounded-2xl border border-color backdrop-blur-sm w-fit transition-transform hover:scale-105">
                            {item.icon}
                            <span className="font-semibold text-sm">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT SIDE - LOGIN FORM */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="glass-panel p-10 w-full max-w-md shadow-lg animate-fade-in" style={{ animationDelay: '0.2s', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">
                            {isRegister ? 'Criar Nova Conta' : 'Bem-vindo de volta'}
                        </h2>
                        <p className="text-muted text-sm">
                            {isRegister ? 'Cadastre-se para começar sua gestão' : 'Entre com suas credenciais para continuar'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {isRegister && (
                            <div className="animate-fade-in">
                                <label className="input-label">Seu Nome Completo</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ex: João Silva"
                                />
                            </div>
                        )}

                        <div>
                            <label className="input-label">Endereço de E-mail</label>
                            <input
                                type="email"
                                className="input-field"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="exemplo@gestorpro.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="input-label">Sua Senha</label>
                            <input
                                type="password"
                                className="input-field"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-danger/10 text-danger p-3 rounded-lg text-xs font-bold flex items-center gap-2 border border-danger/20">
                                <ShieldCheck size={14} /> {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary w-full py-4 text-base shadow-glow flex items-center justify-center gap-3">
                            {isRegister ? (
                                <><UserPlus size={20} /> Criar Conta Agora</>
                            ) : (
                                <><LogIn size={20} /> Entrar no Sistema <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-color text-center">
                        <p className="text-sm font-medium text-muted">
                            {isRegister ? 'Já possui uma conta ativa?' : 'Ainda não é membro?'}
                            {' '}
                            <button
                                type="button"
                                onClick={() => setIsRegister(!isRegister)}
                                className="text-primary font-bold hover:underline transition-all ml-1"
                            >
                                {isRegister ? 'Fazer Login' : 'Cadastre-se Gratuitamente'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
