import { useState, useEffect } from 'react';
import api from '../../services/api';
import AnimatedSection from '../../components/ui/AnimatedSection';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

interface Category { id: number; name: string; description: string; status: string; display_order: number; }

const softColors = [
  'bg-green-50 border-green-200',
  'bg-amber-50 border-amber-200',
  'bg-purple-50 border-purple-200',
  'bg-blue-50 border-blue-200',
  'bg-rose-50 border-rose-200',
  'bg-teal-50 border-teal-200',
];

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchCategories = async () => {
    try { const res = await api.get('/categories/admin/all'); setCategories(res.data.data || []); }
    catch {} finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setEditCategory(null); setFormName(''); setFormDesc(''); setShowModal(true); };
  const openEdit = (cat: Category) => { setEditCategory(cat); setFormName(cat.name); setFormDesc(cat.description || ''); setShowModal(true); };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setIsSaving(true);
    try {
      if (editCategory) {
        await api.put(`/categories/${editCategory.id}`, { name: formName, description: formDesc, image: '', status: editCategory.status, display_order: editCategory.display_order || 0 });
      } else {
        await api.post('/categories', { name: formName, description: formDesc, image: '', display_order: categories.length });
      }
      setShowModal(false); fetchCategories();
    } catch (err: any) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/categories/${deleteId}`); fetchCategories(); }
    catch (err: any) { alert(err.response?.data?.message || 'Erreur'); }
    setConfirmOpen(false); setDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 px-8 h-16 flex items-center justify-between sticky top-0 z-20">
        <h1 className="font-headline text-headline-lg text-on-surface">Gestion des Catégories</h1>
      </header>

      <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
        {/* Stats + Add button */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <AnimatedSection animation="fadeUp">
            <div className="bg-surface rounded-xl border border-outline-variant/30 p-5 shadow-[0_4px_12px_rgba(48,109,41,0.04)]">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Catégories</span>
              <h3 className="font-headline text-headline-lg text-primary font-bold mt-2 tabular-nums text-3xl">{categories.length}</h3>
            </div>
          </AnimatedSection>
          <AnimatedSection animation="fadeUp" delay={100}>
            <div className="bg-surface rounded-xl border border-outline-variant/30 p-5 shadow-[0_4px_12px_rgba(48,109,41,0.04)]">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Actives</span>
              <h3 className="font-headline text-headline-lg text-primary font-bold mt-2 tabular-nums text-3xl">{categories.filter(c => c.status === 'active').length}</h3>
            </div>
          </AnimatedSection>
          <AnimatedSection animation="fadeUp" delay={200}>
            <button onClick={openCreate} className="bg-surface rounded-xl border-2 border-dashed border-outline-variant/50 p-5 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-primary text-[32px]">add_circle</span>
              <span className="font-label-md text-label-md text-primary font-medium">Nouvelle Catégorie</span>
            </button>
          </AnimatedSection>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-surface rounded-xl h-48 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <AnimatedSection key={cat.id} animation="scaleIn" delay={i * 60}>
                <div className={`${softColors[i % softColors.length]} rounded-xl border p-5 hover:shadow-md transition-all h-full flex flex-col`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-headline text-headline-sm text-on-surface">{cat.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm ${cat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {cat.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-4 flex-1">{cat.description || 'Aucune description'}</p>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(cat)} className="flex-1 py-1.5 border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface hover:bg-white/80 transition-colors flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">edit</span> Modifier
                    </button>
                    <button onClick={() => { setDeleteId(cat.id); setConfirmOpen(true); }} className="flex-1 py-1.5 border border-error/30 rounded-lg font-label-sm text-label-sm text-error hover:bg-red-50 transition-colors flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">delete</span> Supprimer
                    </button>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md shadow-2xl animate-[scaleIn_0.2s_ease_both]">
            <h2 className="font-headline text-headline-md text-on-surface mb-4">{editCategory ? 'Modifier' : 'Nouvelle'} Catégorie</h2>
            <div className="space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">Nom</label>
                <input value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" placeholder="Nom de la catégorie" />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">Description</label>
                <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={3} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:border-primary outline-none resize-none" placeholder="Description" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">Annuler</button>
              <button onClick={handleSave} disabled={isSaving || !formName.trim()} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-dark transition-colors disabled:opacity-50">{isSaving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={confirmOpen} title="Supprimer la catégorie" message="Cette action est irréversible. Voulez-vous vraiment supprimer cette catégorie ?" confirmText="Supprimer" onConfirm={handleDelete} onCancel={() => { setConfirmOpen(false); setDeleteId(null); }} danger />
    </div>
  );
};

export default AdminCategories;
