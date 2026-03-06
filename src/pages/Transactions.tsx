import { useState, useMemo } from 'react';
import type { FC, ReactNode } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { format, parseISO } from 'date-fns';
import {
    Plus, Edit2, Trash2, CheckCircle, Circle, Filter,
    Search, Download, Wallet, CreditCard as CardIcon, ChevronDown, Calendar as CalIcon,
    ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import { TransactionModal } from '../components/TransactionModal';
import type { Transaction, Category, CreditCard } from '../types';

export const Transactions: FC = () => {
    const { monthlyTransactions, updateTransaction, deleteTransaction, categories, creditCards, currentMonth } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterSource, setFilterSource] = useState('all'); // all, wallet, card_{id}
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    const toggleStatus = (t: Transaction) => {
        updateTransaction(t.id, { status: t.status === 'paid' ? 'pending' : 'paid' });
    };

    const openEdit = (t: Transaction) => {
        setEditingTx(t);
        setIsModalOpen(true);
    };

    const filtered = useMemo(() => {
        return monthlyTransactions
            .filter((t: Transaction) => {
                const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesType = filterType === 'all' || t.type === filterType;
                const matchesCategory = filterCategory === 'all' || t.categoryId === filterCategory;

                let matchesSource = true;
                if (filterSource === 'wallet') matchesSource = !t.creditCardId;
                else if (filterSource.startsWith('card_')) {
                    const cardId = filterSource.replace('card_', '');
                    matchesSource = t.creditCardId === cardId;
                }

                return matchesSearch && matchesType && matchesCategory && matchesSource;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [monthlyTransactions, searchTerm, filterType, filterCategory, filterSource]);

    return (
        <div className="flex flex-col gap-6 animate-fade-in h-screen max-h-[calc(100vh-100px)]">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-2xl border border-color shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">Extrato Detalhado</h1>
                    <p className="text-muted text-sm mt-1">Refine seus lançamentos e acompanhe seu fluxo</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            className="input-field pl-10 h-10 text-sm"
                            placeholder="Buscar por descrição..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => { setEditingTx(null); setIsModalOpen(true); }} className="btn btn-primary h-10 px-4 shadow-glow whitespace-nowrap">
                        <Plus size={18} /> Novo
                    </button>
                </div>
            </header>

            <div className="glass-panel flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* ADVANCED FILTERS BAR */}
                <div className="p-4 border-b border-color bg-surface/30 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        <select className="input-field text-xs h-8 w-32 py-0" value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="all">Tipos: Todos</option>
                            <option value="income">Só Receitas</option>
                            <option value="expense">Só Despesas</option>
                        </select>
                        <select className="input-field text-xs h-8 w-40 py-0" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                            <option value="all">Categorias: Todas</option>
                            {categories.map((c: Category) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <select className="input-field text-xs h-8 w-40 py-0" value={filterSource} onChange={e => setFilterSource(e.target.value)}>
                            <option value="all">Origem: Todas</option>
                            <option value="wallet">Saldo/Dinheiro</option>
                            {creditCards.map((card: CreditCard) => (
                                <option key={card.id} value={`card_${card.id}`}>{card.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="text-xs text-muted font-medium bg-background px-3 py-1 rounded-full border border-color">
                        {filtered.length} lançamentos encontrados
                    </div>
                </div>

                {/* TABLE WRAPPER */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted">
                            <CalIcon size={48} className="opacity-20 mb-4" />
                            <p className="text-sm">Nenhum lançamento corresponde aos filtros.</p>
                            <button onClick={() => { setSearchTerm(''); setFilterType('all'); setFilterCategory('all'); setFilterSource('all'); }} className="text-primary text-xs mt-2 underline">Limpar todos os filtros</button>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead className="sticky top-0 bg-surface shadow-sm z-10">
                                <tr>
                                    <th style={{ width: '60px' }}>Pago</th>
                                    <th>Descrição</th>
                                    <th>Categoria</th>
                                    <th>Origem</th>
                                    <th>Data</th>
                                    <th className="text-right">Valor</th>
                                    <th className="text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((t: Transaction) => {
                                    const cat = categories.find((c: Category) => c.id === t.categoryId);
                                    const card = creditCards.find((c: CreditCard) => c.id === t.creditCardId);

                                    return (
                                        <tr key={t.id} className="group hover:bg-surface/60 transition-colors">
                                            <td className="text-center">
                                                <button onClick={() => toggleStatus(t)} className="status-btn focus-ring rounded-full p-1" title={t.status === 'paid' ? 'Pendente' : 'Pago'}>
                                                    {t.status === 'paid'
                                                        ? <CheckCircle size={22} className="text-secondary" />
                                                        : <Circle size={22} className="text-muted hover:text-primary transition-colors" />
                                                    }
                                                </button>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-textMain group-hover:text-primary transition-colors">{t.title}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {t.type === 'income'
                                                            ? <ArrowUpCircle size={12} className="text-secondary" />
                                                            : <ArrowDownCircle size={12} className="text-danger" />
                                                        }
                                                        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">
                                                            {t.recurrence === 'none' ? 'Único' : t.recurrence === 'installment' ? `Parcela ${t.currentInstallment}/${t.installmentsCount}` : 'Fixa'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="badge shadow-sm" style={{ backgroundColor: `${cat?.color}15`, color: cat?.color, border: `1px solid ${cat?.color}30` }}>
                                                    {cat?.name || 'Vários'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2 text-xs text-muted font-medium bg-background/50 py-1 px-2 rounded-lg w-fit border border-color">
                                                    {card ? (
                                                        <>
                                                            <CardIcon size={14} style={{ color: card.color }} />
                                                            <span>{card.name}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Wallet size={14} className="text-secondary" />
                                                            <span>Saldo/Dinheiro</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2 text-xs text-muted tabular-nums">
                                                    <CalIcon size={12} /> {format(parseISO(t.date), "dd/MM/yyyy")}
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <div className={`font-bold text-base tabular-nums ${t.type === 'income' ? 'text-secondary font-glow' : 'text-textMain'}`}>
                                                    {t.type === 'income' ? '+' : '-'} R$ {Math.abs(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEdit(t)} className="icon-btn text-muted hover:text-primary p-2 focus-ring"><Edit2 size={16} /></button>
                                                    <button onClick={() => deleteTransaction(t.id)} className="icon-btn text-muted hover:text-danger p-2 focus-ring"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <TransactionModal
                    transaction={editingTx}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};
