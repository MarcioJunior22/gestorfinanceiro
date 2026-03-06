import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import {
    Plus,
    TrendingUp,
    TrendingDown,
    Wallet,
    LogOut,
    Moon,
    Sun,
    Trash2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
    const { transactions, categories, deleteTransaction } = useFinance();
    const { user, logout, updateTheme } = useAuth();
    const [showAdd, setShowAdd] = React.useState(false);

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = Math.abs(transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0));

    const balance = totalIncome - totalExpense;

    // Prepare chart data (last 7 days or by category)
    const chartData = categories.map(cat => {
        const amount = Math.abs(transactions
            .filter(t => t.categoryId === cat.id)
            .reduce((acc, t) => acc + t.amount, 0));
        return { name: cat.name, amount, color: cat.color };
    }).filter(d => d.amount > 0);

    return (
        <div className="animate-fade-in flex-col gap-6" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <header className="flex justify-between items-center mb-4">
                <div>
                    <h1>Olá, {user?.name} 👋</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Aqui está o resumo das suas contas.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => updateTheme(user?.preferences.theme === 'light' ? 'dark' : 'light')}
                        className="btn btn-secondary"
                    >
                        {user?.preferences.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <button onClick={logout} className="btn btn-secondary" style={{ color: 'var(--danger-color)' }}>
                        <LogOut size={18} /> Sair
                    </button>
                </div>
            </header>

            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                <div className="glass-panel p-6 flex-col gap-2" style={{ flex: '1', minWidth: '250px' }}>
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        <Wallet size={18} /> <span>Saldo Total</span>
                    </div>
                    <h2 style={{ fontSize: '2rem' }}>R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                </div>

                <div className="glass-panel p-6 flex-col gap-2" style={{ flex: '1', minWidth: '200px', borderLeft: '4px solid var(--secondary-color)' }}>
                    <div className="flex items-center gap-2" style={{ color: 'var(--secondary-color)' }}>
                        <TrendingUp size={18} /> <span>Receitas</span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem' }}>R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                </div>

                <div className="glass-panel p-6 flex-col gap-2" style={{ flex: '1', minWidth: '200px', borderLeft: '4px solid var(--danger-color)' }}>
                    <div className="flex items-center gap-2" style={{ color: 'var(--danger-color)' }}>
                        <TrendingDown size={18} /> <span>Despesas</span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem' }}>R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                </div>
            </div>

            <div className="flex gap-6 mt-4" style={{ flexWrap: 'wrap' }}>
                <div className="glass-panel p-6 flex-col gap-4" style={{ flex: '2', minWidth: '350px' }}>
                    <div className="flex justify-between items-center">
                        <h3>Distribuição por Categoria</h3>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="name" stroke="var(--text-muted)" />
                                <YAxis stroke="var(--text-muted)" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                                />
                                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-6 flex-col gap-4" style={{ flex: '1.5', minWidth: '350px' }}>
                    <div className="flex justify-between items-center">
                        <h3>Últimas Transações</h3>
                        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
                            <Plus size={18} /> Novo
                        </button>
                    </div>

                    <div className="flex-col gap-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {transactions.length === 0 && (
                            <p className="text-center mt-6" style={{ color: 'var(--text-muted)' }}>Nenhuma transação registrada.</p>
                        )}
                        {[...transactions].reverse().map(t => {
                            const cat = categories.find(c => c.id === t.categoryId);
                            return (
                                <div key={t.id} className="flex justify-between items-center p-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <div className="flex items-center gap-3">
                                        <div style={{ padding: '0.5rem', borderRadius: '8px', background: `${cat?.color}20`, color: cat?.color }}>
                                            {cat?.icon || '?'}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '500' }}>{t.title}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {format(new Date(t.date), "dd 'de' MMMM", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span style={{ fontWeight: '600', color: t.type === 'income' ? 'var(--secondary-color)' : 'var(--text-color)' }}>
                                            {t.type === 'income' ? '+' : ''} R$ {Math.abs(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <button
                                            onClick={() => deleteTransaction(t.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                            onMouseOver={e => e.currentTarget.style.color = 'var(--danger-color)'}
                                            onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {showAdd && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="glass-panel p-6" style={{ width: '100%', maxWidth: '450px', background: 'var(--bg-color)' }}>
                        <AddTransaction
                            onClose={() => setShowAdd(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Internal AddTransaction wrapper to be used only inside dashboard if needed, 
// but we imported it from outside for better composition.
import { AddTransaction } from './AddTransaction';
