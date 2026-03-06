import React, { useMemo, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import {
    TrendingUp, TrendingDown, Wallet, Calendar, CircleDashed, Target, Edit2,
    ArrowUpRight, ArrowDownRight, Zap, MoreHorizontal, ChevronRight, ChevronLeft
} from 'lucide-react';
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Transaction, Category } from '../types';

export const Dashboard: FC = () => {
    const { user, updateBudget } = useAuth();
    const { currentMonth, setCurrentMonth, monthlyTransactions, categories, creditCards } = useFinance();
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [budgetCat, setBudgetCat] = useState('');
    const [budgetLimit, setBudgetLimit] = useState('');

    const metrics = useMemo(() => {
        let income = 0, expense = 0, pending = 0;

        monthlyTransactions.forEach((t: Transaction) => {
            const amount = Math.abs(t.amount);
            if (t.type === 'income') {
                if (t.status === 'paid') income += amount;
                else pending += amount;
            } else {
                if (t.status === 'paid') expense += amount;
                else pending -= amount;
            }
        });

        return { income, expense, balance: income - expense, pending };
    }, [monthlyTransactions]);

    const pieData = useMemo(() => {
        const expenses = monthlyTransactions.filter((t: Transaction) => t.type === 'expense' && t.status === 'paid');
        const grouped = expenses.reduce((acc: Record<string, number>, t: Transaction) => {
            acc[t.categoryId] = (acc[t.categoryId] || 0) + Math.abs(t.amount);
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped).map(([catId, amount]) => {
            const cat = categories.find((c: Category) => c.id === catId);
            return { name: cat?.name || 'Outros', value: amount, color: cat?.color || '#cbd5e1' };
        }).sort((a, b) => b.value - a.value);
    }, [monthlyTransactions, categories]);

    const areaData = useMemo(() => {
        const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        let runningBalance = 0;

        const data = Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayTxs = monthlyTransactions.filter((t: Transaction) => new Date(t.date).getDate() === day && t.status === 'paid');
            const dailyNet = dayTxs.reduce((acc: number, t: Transaction) => t.type === 'income' ? acc + Math.abs(t.amount) : acc - Math.abs(t.amount), 0);
            runningBalance += dailyNet;
            return { day: `${day}`, balanço: runningBalance };
        });
        return data;
    }, [monthlyTransactions, currentMonth]);

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* HERO HEADER */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface p-6 rounded-2xl shadow-sm border border-color">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted text-sm mt-1">Bem-vindo de volta, <span className="font-bold text-primary">{user?.name}</span>!</p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="icon-btn focus-ring p-2 bg-background border border-color hover:bg-surface"><ChevronLeft size={20} /></button>
                    <div className="flex items-center gap-2 font-bold bg-primary text-white px-5 py-2.5 rounded-xl shadow-glow">
                        <Calendar size={18} />
                        <span className="capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
                    </div>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="icon-btn focus-ring p-2 bg-background border border-color hover:bg-surface"><ChevronRight size={20} /></button>
                </div>
            </header>

            {/* KEY METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-6 premium-card card-balance">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/20 rounded-xl text-white"><Wallet size={24} /></div>
                        <Zap size={20} className="text-white/40" />
                    </div>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Saldo em Conta</p>
                    <h2 className="text-3xl font-black text-white mt-2 tabular-nums">R$ {metrics.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                </div>

                <div className="glass-panel p-6 premium-card">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-secondary/10 rounded-xl text-secondary"><ArrowUpRight size={24} /></div>
                        <MoreHorizontal size={20} className="text-muted/40" />
                    </div>
                    <p className="text-muted text-xs font-bold uppercase tracking-wider">Receitas Totais</p>
                    <h2 className="text-2xl font-black mt-2 text-secondary tabular-nums">R$ {metrics.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                </div>

                <div className="glass-panel p-6 premium-card">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-danger/10 rounded-xl text-danger"><ArrowDownRight size={24} /></div>
                        <MoreHorizontal size={20} className="text-muted/40" />
                    </div>
                    <p className="text-muted text-xs font-bold uppercase tracking-wider">Despesas Totais</p>
                    <h2 className="text-2xl font-black mt-2 text-textMain tabular-nums">R$ {metrics.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                </div>

                <div className="glass-panel p-6 premium-card">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-warning/10 rounded-xl text-warning"><CircleDashed size={24} /></div>
                        <MoreHorizontal size={20} className="text-muted/40" />
                    </div>
                    <p className="text-muted text-xs font-bold uppercase tracking-wider">Previsão Pendente</p>
                    <h2 className="text-2xl font-black mt-2 text-warning tabular-nums">R$ {metrics.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                </div>
            </div>

            {/* CHARTS LAYER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-panel p-8 lg:col-span-2 flex flex-col min-h-[450px]">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold">Fluxo de Caixa Diário</h3>
                        <div className="text-xs text-muted bg-background px-3 py-1 rounded-full border border-color font-medium">ESTE MÊS</div>
                    </div>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={areaData}>
                                <defs>
                                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="day" stroke="var(--text-muted)" axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                                <YAxis stroke="var(--text-muted)" axisLine={false} tickLine={false} tickFormatter={(v: any) => `R$${v}`} style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-lg)', backgroundColor: 'var(--surface-color)', padding: '12px' }}
                                    formatter={(v: number) => `R$ ${v.toLocaleString('pt-BR')}`}
                                />
                                <Area type="monotone" dataKey="balanço" stroke="var(--primary-color)" strokeWidth={4} fillOpacity={1} fill="url(#colorBalance)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-8 flex flex-col h-full">
                    <h3 className="text-lg font-bold mb-8">Gastos por Categoria</h3>
                    {pieData.length > 0 ? (
                        <div className="flex flex-col flex-1">
                            <div className="flex-1 min-h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'var(--surface-color)' }} />
                                        <Pie data={pieData} innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-8 flex flex-col gap-3 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
                                {pieData.map(d => (
                                    <div key={d.name} className="flex justify-between items-center text-sm p-2 hover:bg-background rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div style={{ width: 12, height: 12, borderRadius: '4px', backgroundColor: d.color }}></div>
                                            <span className="font-semibold">{d.name}</span>
                                        </div>
                                        <span className="font-black">R$ {d.value.toLocaleString('pt-BR')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-muted py-20 bg-background/50 rounded-2xl border border-dashed border-color">
                            <CircleDashed size={48} className="mb-4 opacity-20" />
                            <p className="text-xs font-bold uppercase tracking-widest">Nenhuma atividade</p>
                        </div>
                    )}
                </div>
            </div>

            {/* BUDGET GOALS FOOTER */}
            <div className="glass-panel p-8 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Target size={24} className="text-primary" /> Metas de Gastos
                        </h3>
                        <p className="text-muted text-xs mt-1">Monitore seus limites mensais definidos</p>
                    </div>
                    <button onClick={() => setIsBudgetModalOpen(true)} className="btn btn-secondary px-4 py-2 flex items-center gap-2 hover:bg-primary hover:text-white transition-all">
                        <Edit2 size={16} /> <span className="text-sm">Configurar</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.keys(user?.preferences?.monthlyBudgets || {}).length > 0 ? (
                        Object.entries(user!.preferences.monthlyBudgets!).map(([catId, limit]) => {
                            const cat = categories.find((c: Category) => c.id === catId);
                            if (!cat) return null;

                            const spent = monthlyTransactions
                                .filter((t: Transaction) => t.categoryId === catId && t.type === 'expense')
                                .reduce((acc: number, t: Transaction) => acc + Math.abs(t.amount), 0);

                            const percent = Math.min((spent / limit) * 100, 100);
                            const isDanger = percent >= 90;
                            const isWarning = percent >= 75 && percent < 90;

                            return (
                                <div key={catId} className="flex flex-col p-5 bg-background border border-color rounded-2xl transition-all hover:border-primary/30 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg shadow-sm" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}><Target size={18} /></div>
                                            <span className="font-bold text-sm uppercase tracking-wider">{cat.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-black ${isDanger ? 'text-danger' : (isWarning ? 'text-warning' : 'text-secondary')}`}>
                                                {percent.toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mb-3 font-black text-xs tabular-nums">
                                        <span className="text-lg">R$ {spent.toLocaleString('pt-BR')}</span>
                                        <span className="text-muted opacity-50">LMT: R$ {limit.toLocaleString('pt-BR')}</span>
                                    </div>

                                    <div className="w-full bg-surface rounded-full h-2.5 overflow-hidden shadow-inner border border-color">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${isDanger ? 'shadow-glow-danger bg-danger' : (isWarning ? 'shadow-glow-warning bg-warning' : 'shadow-glow-secondary bg-secondary')}`}
                                            style={{ width: `${percent}%`, backgroundColor: isDanger ? undefined : (isWarning ? undefined : cat.color) }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 bg-background/50 rounded-2xl border border-dashed border-color text-muted text-center">
                            <Target size={40} className="mb-4 opacity-10" />
                            <h4 className="font-bold text-sm">Nenhuma meta configurada ainda</h4>
                            <p className="text-xs mt-1 max-w-xs">Defina limites para suas categorias e visualize aqui o quanto você já gastou.</p>
                            <button onClick={() => setIsBudgetModalOpen(true)} className="btn btn-primary mt-6 px-8">Começar Agora</button>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL ORCMENTO */}
            {isBudgetModalOpen && (
                <div className="modal-overlay animate-fade-in">
                    <div className="modal-content glass-panel p-10 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-2">Meta Financeira</h2>
                        <p className="text-muted text-sm mb-8">Defina o máximo que deseja gastar em uma categoria por mês.</p>

                        <div className="flex flex-col gap-6 mb-10">
                            <div>
                                <label className="input-label">Escolha a Categoria</label>
                                <select className="input-field" value={budgetCat} onChange={e => setBudgetCat(e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {categories.filter((c: Category) => c.type === 'expense' || c.type === 'both').map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Limite Mensal Desejado (R$)</label>
                                <input type="number" step="0.01" className="input-field py-4 text-xl font-black" value={budgetLimit} onChange={e => setBudgetLimit(e.target.value)} placeholder="0.00" />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setIsBudgetModalOpen(false)} className="btn btn-secondary flex-1 py-4">Cancelar</button>
                            <button
                                onClick={() => {
                                    if (budgetCat && budgetLimit) {
                                        updateBudget(budgetCat, Number(budgetLimit));
                                        setBudgetCat(''); setBudgetLimit('');
                                        setIsBudgetModalOpen(false);
                                    }
                                }}
                                className="btn btn-primary flex-1 py-4 shadow-glow font-bold"
                            >
                                Confirmar Meta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
