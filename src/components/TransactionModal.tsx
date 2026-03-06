import { useState } from 'react';
import type { FC } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import type { Transaction, RecurrenceType, Category, CreditCard } from '../types';
import { X, Save, CreditCard as CardIcon, Wallet } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface TransactionModalProps {
    transaction: Transaction | null;
    onClose: () => void;
}

export const TransactionModal: FC<TransactionModalProps> = ({ transaction, onClose }) => {
    const { categories, creditCards, addTransaction, updateTransaction } = useFinance();

    const [title, setTitle] = useState(transaction?.title || '');
    const [amount, setAmount] = useState(transaction ? Math.abs(transaction.amount).toString() : '');
    const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense');
    const [categoryId, setCategoryId] = useState(transaction?.categoryId || categories[0]?.id || '');
    const [date, setDate] = useState(transaction ? format(parseISO(transaction.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    const [status, setStatus] = useState<'paid' | 'pending'>(transaction?.status || 'paid');
    const [recurrence, setRecurrence] = useState<RecurrenceType>(transaction?.recurrence || 'none');
    const [installmentsCount, setInstallmentsCount] = useState(transaction?.installmentsCount?.toString() || '2');
    const [creditCardId, setCreditCardId] = useState<string | undefined>(transaction?.creditCardId);

    const availableCategories = categories.filter((c: Category) => c.type === 'both' || c.type === type);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount || !categoryId) return;

        const val = Number(amount);
        const finalAmount = type === 'expense' ? -Math.abs(val) : Math.abs(val);

        const dataToSave = {
            title,
            amount: finalAmount,
            type,
            categoryId,
            date: new Date(date + 'T12:00:00Z').toISOString(), // Use midday to avoid timezone shifts
            status,
            recurrence,
            creditCardId: type === 'expense' ? creditCardId : undefined,
            installmentsCount: recurrence === 'installment' ? Number(installmentsCount) : undefined
        };

        if (transaction) {
            updateTransaction(transaction.id, dataToSave);
        } else {
            addTransaction(dataToSave);
        }
        onClose();
    };

    return (
        <div className="modal-overlay animate-fade-in">
            <div className="modal-content glass-panel p-6 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{transaction ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
                    <button onClick={onClose} className="icon-btn focus-ring"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* TABS FOR TYPE */}
                    <div className="flex bg-surface p-1 rounded-xl border border-color shadow-inner">
                        <button type="button"
                            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${type === 'expense' ? 'bg-danger text-white shadow-glow' : 'text-muted hover:text-white'}`}
                            onClick={() => { setType('expense'); setStatus('paid'); }}
                        >Despesa</button>
                        <button type="button"
                            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${type === 'income' ? 'bg-secondary text-white shadow-glow' : 'text-muted hover:text-white'}`}
                            onClick={() => { setType('income'); setStatus('paid'); }}
                        >Receita</button>
                    </div>

                    <div>
                        <label className="input-label">Descrição</label>
                        <input className="input-field" placeholder="Ex: Supermercado, Aluguel..." value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Valor (R$)</label>
                            <input type="number" step="0.01" className="input-field font-bold" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} required />
                        </div>
                        <div>
                            <label className="input-label">Data</label>
                            <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Categoria</label>
                            <select className="input-field" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                                <option value="">Selecione...</option>
                                {availableCategories.map((c: Category) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Status</label>
                            <select className="input-field" value={status} onChange={e => setStatus(e.target.value as any)}>
                                <option value="paid">{type === 'expense' ? 'Pago' : 'Recebido'}</option>
                                <option value="pending">Pendente</option>
                            </select>
                        </div>
                    </div>

                    {type === 'expense' && (
                        <div className="p-4 bg-surface/50 border border-color rounded-xl">
                            <label className="input-label mb-3 flex items-center gap-2">
                                <Wallet size={16} className="text-primary" /> Origem do Pagamento
                            </label>
                            <div className="flex flex-col gap-2">
                                <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${!creditCardId ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'bg-surface border-color hover:border-muted'}`}>
                                    <div className="flex items-center gap-3">
                                        <Wallet size={18} className={!creditCardId ? 'text-primary' : 'text-muted'} />
                                        <span className="text-sm font-medium">Saldo em Conta / Dinheiro</span>
                                    </div>
                                    <input type="radio" name="payment_source" checked={!creditCardId} onChange={() => setCreditCardId(undefined)} className="hidden" />
                                    {!creditCardId && <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/20" />}
                                </label>

                                {creditCards.map((card: CreditCard) => (
                                    <label key={card.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${creditCardId === card.id ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'bg-surface border-color hover:border-muted'}`}>
                                        <div className="flex items-center gap-3">
                                            <CardIcon size={18} style={{ color: card.color }} />
                                            <span className="text-sm font-medium">Cartão: {card.name}</span>
                                        </div>
                                        <input type="radio" name="payment_source" checked={creditCardId === card.id} onChange={() => setCreditCardId(card.id)} className="hidden" />
                                        {creditCardId === card.id && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: card.color, boxShadow: `0 0 10px ${card.color}` }} />}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {!transaction && (
                        <div className="p-4 bg-surface/50 border border-color rounded-xl">
                            <label className="input-label mb-3">Recorrência</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button type="button" onClick={() => setRecurrence('none')} className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all ${recurrence === 'none' ? 'bg-primary border-primary text-white' : 'bg-background border-color text-muted'}`}>Único</button>
                                <button type="button" onClick={() => setRecurrence('fixed')} className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all ${recurrence === 'fixed' ? 'bg-primary border-primary text-white' : 'bg-background border-color text-muted'}`}>Fixo</button>
                                <button type="button" onClick={() => setRecurrence('installment')} className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all ${recurrence === 'installment' ? 'bg-primary border-primary text-white' : 'bg-background border-color text-muted'}`}>Parcelado</button>
                            </div>

                            {recurrence === 'installment' && (
                                <div className="mt-4 animate-scale-up">
                                    <label className="input-label text-xs">Parcelas (Total será dividido)</label>
                                    <input type="number" min="2" max="120" className="input-field" value={installmentsCount} onChange={e => setInstallmentsCount(e.target.value)} />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-4 mt-2">
                        <button type="button" onClick={onClose} className="btn btn-secondary flex-1 py-3">Cancelar</button>
                        <button type="submit" className="btn btn-primary flex-1 py-3 shadow-glow font-bold"><Save size={18} /> Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
