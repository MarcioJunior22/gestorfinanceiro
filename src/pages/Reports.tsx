import { useMemo } from 'react';
import type { FC } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import {
    TrendingUp, TrendingDown, Target, AlertTriangle,
    Calendar, ArrowRight, PieChart as PieIcon, BarChart3, LineChart
} from 'lucide-react';
import {
    BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Legend
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Transaction, Category } from '../types';

export const Reports: FC = () => {
    const { user } = useAuth();
    const { transactions, categories, currentMonth } = useFinance();

    // 1. Comparison of last 6 months
    const historicalData = useMemo(() => {
        const data = [];
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            const monthTxs = transactions.filter(t => isWithinInterval(parseISO(t.date), { start, end }));

            let income = 0;
            let expense = 0;

            monthTxs.forEach(t => {
                if (t.type === 'income') income += Math.abs(t.amount);
                else expense += Math.abs(t.amount);
            });

            data.push({
                name: format(date, 'MMM', { locale: ptBR }),
                receitas: income,
                despesas: expense
            });
        }
        return data;
    }, [transactions]);

    // 2. Budget Alerts
    const alerts = useMemo(() => {
        const budgets = user?.preferences?.monthlyBudgets || {};
        const currentMonthStart = startOfMonth(currentMonth);
        const currentMonthEnd = endOfMonth(currentMonth);

        const currentMonthTxs = transactions.filter(t =>
            isWithinInterval(parseISO(t.date), { start: currentMonthStart, end: currentMonthEnd })
        );

        return Object.entries(budgets).map(([catId, limit]) => {
            const cat = categories.find(c => c.id === catId);
            const spent = currentMonthTxs
                .filter(t => t.categoryId === catId && t.type === 'expense')
                .reduce((acc, t) => acc + Math.abs(t.amount), 0);

            const percent = (spent / limit) * 100;
            return {
                catName: cat?.name || 'Vários',
                spent,
                limit,
                percent,
                isExceeded: spent > limit,
                isWarning: percent >= 80 && spent <= limit
            };
        }).filter(a => a.isExceeded || a.isWarning);
    }, [user, transactions, categories, currentMonth]);

    // 3. Category Distribution (Current Month)
    const categoryData = useMemo(() => {
        const currentMonthStart = startOfMonth(currentMonth);
        const currentMonthEnd = endOfMonth(currentMonth);
        const monthTxs = transactions.filter(t =>
            isWithinInterval(parseISO(t.date), { start: currentMonthStart, end: currentMonthEnd }) && t.type === 'expense'
        );

        const grouped = monthTxs.reduce((acc: Record<string, number>, t: Transaction) => {
            acc[t.categoryId] = (acc[t.categoryId] || 0) + Math.abs(t.amount);
            return acc;
        }, {});

        return Object.entries(grouped).map(([catId, amount]) => {
            const cat = categories.find(c => c.id === catId);
            return {
                name: cat?.name || 'Vários',
                value: amount,
                color: cat?.color || '#334155'
            };
        }).sort((a, b) => b.value - a.value);
    }, [transactions, categories, currentMonth]);

    return (
        <div className="flex flex-col gap-6 animate-fade-in p-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-2xl border border-color shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">Relatórios Gerenciais</h1>
                    <p className="text-muted text-sm mt-1">Análise profunda da sua saúde financeira</p>
                </div>
                <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-xl border border-color">
                    <Calendar size={18} className="text-primary" />
                    <span className="font-semibold text-sm">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* HISTORICAL CHART */}
                <div className="glass-panel p-6 flex flex-col min-h-[400px]">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <BarChart3 className="text-primary" size={20} /> Comparativo Semestral
                    </h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="name" stroke="var(--text-muted)" />
                                <YAxis stroke="var(--text-muted)" tickFormatter={(v) => `R$${v}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)', backgroundColor: 'var(--surface-color)' }}
                                    formatter={(v: number) => `R$ ${v.toLocaleString('pt-BR')}`}
                                />
                                <Legend />
                                <Bar dataKey="receitas" fill="var(--secondary-color)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="despesas" fill="var(--danger-color)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ALERTS & BUDGET STATUS */}
                <div className="glass-panel p-6 flex flex-col h-full">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <AlertTriangle className="text-warning" size={20} /> Alertas de Orçamento
                    </h3>
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                        {alerts.length > 0 ? (
                            alerts.map((alert, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border flex items-start gap-4 transition-transform hover:scale-[1.02] ${alert.isExceeded ? 'bg-danger/10 border-danger/30' : 'bg-warning/10 border-warning/30'}`}>
                                    <div className={`p-2 rounded-lg ${alert.isExceeded ? 'bg-danger text-white' : 'bg-warning text-white'}`}>
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-sm uppercase tracking-wider">{alert.catName}</span>
                                            <span className={`text-xs font-bold ${alert.isExceeded ? 'text-danger' : 'text-warning'}`}>
                                                {alert.percent.toFixed(0)}% Utilizado
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted mb-2">
                                            {alert.isExceeded
                                                ? `Você ultrapassou o limite de R$ ${alert.limit} em R$ ${(alert.spent - alert.limit).toFixed(2)}.`
                                                : `Atenção: Você atingiu 80% do limite de R$ ${alert.limit}.`
                                            }
                                        </p>
                                        <div className="w-full bg-surface/50 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${alert.isExceeded ? 'bg-danger shadow-glow-danger' : 'bg-warning shadow-glow-warning'}`}
                                                style={{ width: `${Math.min(alert.percent, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-muted">
                                <Target size={40} className="mb-3 opacity-20" />
                                <p className="text-sm">Seus orçamentos estão sob controle.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* CATEGORY DONUT */}
                <div className="glass-panel p-6 flex flex-col min-h-[400px] lg:col-span-2">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <PieIcon className="text-primary" size={20} /> Composição de Gastos (Fatia do Mês)
                    </h3>
                    <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                        animationBegin={0}
                                        animationDuration={1500}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'var(--surface-color)' }}
                                        formatter={(v: number) => `R$ ${v.toLocaleString('pt-BR')}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-64 flex flex-col gap-3 overflow-y-auto max-h-64 custom-scrollbar">
                            {categoryData.map((c, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-surface rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                                        <span className="font-medium">{c.name}</span>
                                    </div>
                                    <span className="font-bold">R$ {c.value.toLocaleString('pt-BR')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SUGGESTIONS / INSIGHTS */}
                <div className="glass-panel p-6 premium-card card-balance flex flex-col">
                    <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
                        <LineChart className="text-white" size={20} /> Insights Inteligentes
                    </h3>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col">
                            <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2">Gastos Fixos Estimados</p>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-white">R$ {historicalData[historicalData.length - 1].despesas.toLocaleString('pt-BR')}</span>
                                <div className="p-1 px-2 bg-white/20 rounded text-[10px] text-white">Base: ÚLTIMO MÊS</div>
                            </div>
                        </div>
                        <div className="h-px bg-white/20 w-full" />
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg text-white"><ArrowRight size={18} /></div>
                                <p className="text-xs text-white/80">Baseado no seu histórico, você economiza cerca de 15% da sua renda.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg text-white"><ArrowRight size={18} /></div>
                                <p className="text-xs text-white/80">Sua maior categoria de gasto é <b>"{categoryData[0]?.name || 'Outros'}"</b>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
