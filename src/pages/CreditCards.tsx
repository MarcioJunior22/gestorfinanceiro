import React, { useState, useMemo } from 'react';
import type { FC } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import {
    CreditCard as CardIcon, Plus, Trash2, Edit2,
    ChevronRight, AlertCircle, Calendar, Hash,
    Smartphone, Zap, MoreVertical, LayoutGrid, LucideIcon
} from 'lucide-react';
import type { CreditCard, Transaction } from '../types';
import { format, parseISO, isAfter, isBefore, addMonths, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const CreditCardsPage: FC = () => {
    const { creditCards, addCreditCard, updateCreditCard, deleteCreditCard, currentMonth, transactions } = useFinance();
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');
    const [closingDay, setClosingDay] = useState('25');
    const [dueDay, setDueDay] = useState('5');
    const [color, setColor] = useState('#6366f1');

    const openModal = (card?: CreditCard) => {
        if (card) {
            setEditingCard(card);
            setName(card.name);
            setLimit(card.limit.toString());
            setClosingDay(card.closingDay.toString());
            setDueDay(card.dueDay.toString());
            setColor(card.color);
        } else {
            setEditingCard(null);
            setName('');
            setLimit('');
            setClosingDay('25');
            setDueDay('5');
            setColor('#6366f1');
        }
        setIsCardModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const data = { name, limit: Number(limit), closingDay: Number(closingDay), dueDay: Number(dueDay), color };
        if (editingCard) updateCreditCard(editingCard.id, data);
        else addCreditCard(data);
        setIsCardModalOpen(false);
    };

    const getInvoiceDetails = (card: CreditCard, refMonth: Date) => {
        const cardTransactions = transactions.filter(t => t.creditCardId === card.id);
        let currentTotal = 0;

        cardTransactions.forEach(t => {
            const d = parseISO(t.date);
            // Simplified logic: transactions in the same calendar month
            if (d.getMonth() === refMonth.getMonth() && d.getFullYear() === refMonth.getFullYear()) {
                currentTotal += Math.abs(t.amount);
            }
        });

        const available = card.limit - currentTotal;
        return { total: currentTotal, available: available >= 0 ? available : 0 };
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in p-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-2xl border border-color shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <div className="bg-primary p-2 rounded-xl text-white shadow-glow"><CardIcon size={24} /></div>
                        Gestão de Cartões
                    </h1>
                    <p className="text-muted text-sm mt-1">Controle seus limites e visualize suas faturas mensalmente</p>
                </div>
                <button onClick={() => openModal()} className="btn btn-primary px-6 py-3 shadow-glow gap-3">
                    <Plus size={20} /> <span className="text-base">Adicionar Cartão</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {creditCards.map(card => {
                    const invoice = getInvoiceDetails(card, currentMonth);
                    const usagePercent = Math.min((invoice.total / card.limit) * 100, 100);

                    return (
                        <div key={card.id} className="glass-panel group relative flex flex-col h-[280px] overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]">
                            <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: card.color, boxShadow: `0 0 15px ${card.color}70` }}></div>

                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 rounded-2xl text-white shadow-lg transition-transform group-hover:rotate-12" style={{ background: `linear-gradient(135deg, ${card.color}, #00000050)`, boxShadow: `0 8px 20px ${card.color}30` }}>
                                            <CardIcon size={28} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl tracking-tight text-textMain">{card.name}</h3>
                                            <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Crédito Ativo</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                        <button onClick={() => openModal(card)} className="icon-btn focus-ring hover:bg-primary/10 hover:text-primary"><Edit2 size={16} /></button>
                                        <button onClick={() => deleteCreditCard(card.id)} className="icon-btn focus-ring hover:bg-danger/10 hover:text-danger"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Gasto Atual</span>
                                            <span className="text-3xl font-black tabular-nums">R$ {invoice.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[10px] font-black ${usagePercent > 90 ? 'bg-danger text-white' : 'bg-surface border border-color text-muted'}`}>
                                            {usagePercent.toFixed(0)}%
                                        </div>
                                    </div>

                                    <div className="w-full bg-background border border-color rounded-full h-3 mb-4 overflow-hidden shadow-inner p-1">
                                        <div className={`h-full rounded-full transition-all duration-1000 ease-out`}
                                            style={{ width: `${usagePercent}%`, backgroundColor: usagePercent > 90 ? 'var(--danger-color)' : card.color, boxShadow: `0 0 10px ${card.color}50` }}></div>
                                    </div>

                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest bg-background/50 p-2 rounded-lg border border-color">
                                        <span className="text-muted">LIMITE: R$ {card.limit.toLocaleString('pt-BR')}</span>
                                        <span className={usagePercent > 90 ? 'text-danger' : 'text-secondary'}>
                                            DPONÍVEL: R$ {invoice.available.toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface/50 border-t border-color p-4 px-8 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Zap size={12} className="text-warning" />
                                    <span>FECHA: DIA {card.closingDay}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={12} className="text-primary" />
                                    <span>VENCE: DIA {card.dueDay}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {creditCards.length === 0 && (
                    <div className="glass-panel p-20 flex flex-col items-center justify-center text-center text-muted bg-background/50 border-dashed border-2 border-color lg:col-span-3">
                        <div className="bg-surface-color p-8 rounded-full shadow-lg mb-8 border border-color">
                            <CardIcon size={64} className="opacity-20" />
                        </div>
                        <h3 className="text-2xl font-black text-textMain mb-4">Mantenha seus cartões sob controle</h3>
                        <p className="mb-10 max-w-md text-base">Adicione seus cartões de crédito agora para visualizar faturas consolidadas e não perder prazos de vencimento.</p>
                        <button onClick={() => openModal()} className="btn btn-primary px-10 py-4 shadow-glow font-black flex items-center gap-4">
                            <Plus size={24} /> Criar meu primeiro cartão
                        </button>
                    </div>
                )}
            </div>

            {isCardModalOpen && (
                <div className="modal-overlay animate-fade-in">
                    <div className="modal-content glass-panel p-10 max-w-lg w-full">
                        <h2 className="text-2xl font-black mb-2">{editingCard ? 'Configurar Cartão' : 'Novo Cartão de Crédito'}</h2>
                        <p className="text-muted text-sm mb-8">Personalize os detalhes do seu cartão para uma gestão precisa.</p>

                        <form onSubmit={handleSave} className="flex flex-col gap-6">
                            <div>
                                <label className="input-label">Nome do Emissor / Cartão</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                    <input className="input-field pl-12 h-14" placeholder="Ex: Nubank Ultravioleta..." value={name} onChange={e => setName(e.target.value)} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="input-label">Limite de Crédito (R$)</label>
                                    <input type="number" step="0.01" className="input-field h-14" value={limit} onChange={e => setLimit(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="input-label">Cor Identificadora</label>
                                    <div className="flex items-center gap-2 h-14 bg-background border-2 border-color rounded-xl px-4">
                                        <input type="color" className="w-8 h-8 rounded-lg cursor-pointer bg-transparent" value={color} onChange={e => setColor(e.target.value)} />
                                        <div className="w-4 h-4 rounded-full border border-color" style={{ backgroundColor: color }} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-background border border-color rounded-2xl">
                                    <label className="input-label text-[10px]">Dia de Fechamento</label>
                                    <div className="flex items-center gap-3">
                                        <Zap size={20} className="text-warning" />
                                        <input type="number" min="1" max="31" className="bg-transparent border-none text-2xl font-black focus:outline-none w-full tabular-nums" value={closingDay} onChange={e => setClosingDay(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="p-4 bg-background border border-color rounded-2xl">
                                    <label className="input-label text-[10px]">Dia de Vencimento</label>
                                    <div className="flex items-center gap-3">
                                        <Calendar size={20} className="text-primary" />
                                        <input type="number" min="1" max="31" className="bg-transparent border-none text-2xl font-black focus:outline-none w-full tabular-nums" value={dueDay} onChange={e => setDueDay(e.target.value)} required />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button type="button" onClick={() => setIsCardModalOpen(false)} className="btn btn-secondary flex-1 py-4">Voltar</button>
                                <button type="submit" className="btn btn-primary flex-1 py-4 shadow-glow font-bold">{editingCard ? 'Atualizar Cartão' : 'Confirmar e Salvar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
