import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Plus, X } from 'lucide-react';

export const AddTransaction: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { categories, addTransaction } = useFinance();
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [categoryId, setCategoryId] = useState(categories[0]?.id || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount || !categoryId) return;

        addTransaction({
            title,
            amount: type === 'expense' ? -Math.abs(Number(amount)) : Math.abs(Number(amount)),
            type,
            categoryId,
            date: new Date().toISOString()
        });
        onClose();
    };

    return (
        <div className="flex-col gap-4 animate-fade-in">
            <div className="flex justify-between items-center">
                <h3>Nova Transação</h3>
                <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.2rem' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-col gap-4">
                <div>
                    <label className="input-label">Descrição</label>
                    <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>

                <div className="flex gap-4">
                    <div style={{ flex: 1 }}>
                        <label className="input-label">Valor</label>
                        <input type="number" className="input-field" value={amount} onChange={e => setAmount(e.target.value)} required />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="input-label">Tipo</label>
                        <select className="input-field" value={type} onChange={e => setType(e.target.value as any)}>
                            <option value="expense">Despesa</option>
                            <option value="income">Receita</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="input-label">Categoria</label>
                    <select className="input-field" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-primary w-full">
                    <Plus size={18} /> Adicionar
                </button>
            </form>
        </div>
    );
};
