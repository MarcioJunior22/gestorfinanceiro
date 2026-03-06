import React, { useState } from 'react';
import type { FC } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Plus, Edit2, Trash2, Tags, Folder, LayoutGrid, Sparkles } from 'lucide-react';
import type { Category } from '../types';

export const CategoriesPage: FC = () => {
    const { categories, addCategory, updateCategory, deleteCategory } = useFinance();
    const [isEditing, setIsEditing] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [color, setColor] = useState('#6366f1');
    const [type, setType] = useState<'income' | 'expense' | 'both'>('expense');

    const handleSave = () => {
        if (!name) return;
        if (isEditing) {
            updateCategory(isEditing, { name, color, type });
            setIsEditing(null);
        } else {
            addCategory({ name, color, type, icon: 'folder' });
        }
        setName('');
        setColor('#6366f1');
        setType('expense');
    };

    const handleEdit = (c: Category) => {
        setIsEditing(c.id);
        setName(c.name);
        setColor(c.color);
        setType(c.type);
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in p-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-2xl border border-color shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <div className="bg-primary p-2 rounded-xl text-white shadow-glow"><Tags size={24} /></div>
                        Categorias de Gastos
                    </h1>
                    <p className="text-muted text-sm mt-1">Personalize sua organização e facilite a análise</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM PANEL */}
                <div className="glass-panel p-8 lg:col-span-1 h-fit sticky top-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        {isEditing ? <Edit2 size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
                        {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
                    </h3>

                    <div className="flex flex-col gap-6">
                        <div>
                            <label className="input-label">Nome da Categoria</label>
                            <input type="text" className="input-field h-14" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Educação, Lazer..." required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">Cor de destaque</label>
                                <div className="flex items-center gap-2 h-14 bg-background border-2 border-color rounded-xl px-4">
                                    <input type="color" className="w-8 h-8 rounded-lg cursor-pointer bg-transparent" value={color} onChange={e => setColor(e.target.value)} />
                                    <div className="w-4 h-4 rounded-full border border-color" style={{ backgroundColor: color }} />
                                </div>
                            </div>
                            <div>
                                <label className="input-label">Tipo de Fluxo</label>
                                <select className="input-field h-14 text-sm font-bold" value={type} onChange={e => setType(e.target.value as any)}>
                                    <option value="expense">Despesas</option>
                                    <option value="income">Receitas</option>
                                    <option value="both">Ambos</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button onClick={handleSave} className="btn btn-primary flex-1 py-4 shadow-glow font-bold">
                                {isEditing ? 'Atualizar Dados' : 'Criar Categoria'}
                            </button>
                            {isEditing && (
                                <button onClick={() => { setIsEditing(null); setName(''); }} className="btn btn-secondary px-6">
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* LIST PANEL */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {categories.map(c => (
                            <div key={c.id} className="glass-panel p-6 flex flex-col group relative overflow-hidden transition-all hover:border-primary/30">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-150 group-hover:rotate-12 group-hover:opacity-10">
                                    <Folder size={80} />
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl shadow-sm" style={{ backgroundColor: `${c.color}20`, color: c.color }}>
                                            <Folder size={22} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-lg tracking-tight text-textMain">{c.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${c.type === 'income' ? 'bg-secondary/10 text-secondary' : c.type === 'expense' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>
                                                    {c.type === 'both' ? 'Multivalente' : c.type === 'expense' ? 'Apenas Gasto' : 'Apenas Ganho'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEdit(c)} className="icon-btn hover:bg-primary/10 hover:text-primary focus-ring"><Edit2 size={16} /></button>
                                        <button onClick={() => deleteCategory(c.id)} className="icon-btn hover:bg-danger/10 hover:text-danger focus-ring"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {categories.length === 0 && (
                        <div className="glass-panel p-20 flex flex-col items-center justify-center text-center text-muted bg-background/50 border-dashed border-2 border-color">
                            <Sparkles size={48} className="mb-4 opacity-10" />
                            <h3 className="text-xl font-bold text-textMain">Organize suas Finanças</h3>
                            <p className="mt-2 text-sm max-w-xs">Nenhuma categoria encontrada. Crie uma agora para começar a classificar seus gastos.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
