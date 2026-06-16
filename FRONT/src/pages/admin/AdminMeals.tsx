import { useState, useEffect, useRef } from 'react';
import api from '../../services/apiAdmin';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

interface Meal { id: number; name: string; description: string; price: number; image: string; category_id: number; category_name: string; status: string; is_featured: number; }
interface Category { id: number; name: string; }

const AdminMeals = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMeal, setEditMeal] = useState<Meal | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '', is_featured: 0 });
  const [formImage, setFormImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [mealsRes, catsRes] = await Promise.all([api.get('/meals/admin/all'), api.get('/categories/admin/all')]);
      setMeals(mealsRes.data.data || []);
      setCategories(catsRes.data.data || []);
    } catch {} finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditMeal(null); setForm({ name: '', description: '', price: '', category_id: '', is_featured: 0 }); setFormImage(null); setShowModal(true); };
  const openEdit = (meal: Meal) => { setEditMeal(meal); setForm({ name: meal.name, description: meal.description || '', price: String(meal.price), category_id: String(meal.category_id), is_featured: meal.is_featured || 0 }); setFormImage(meal.image || null); setShowModal(true); };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setFormImage(ev.target?.result as string); };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return;
    setIsSaving(true);
    try {
      const data = { name: form.name, description: form.description, price: Number(form.price), category_id: Number(form.category_id) || categories[0]?.id, image: formImage || '', is_featured: form.is_featured, status: 'available' };
      if (editMeal) await api.put(`/meals/${editMeal.id}`, data);
      else await api.post('/meals', data);
      setShowModal(false); fetchData();
    } catch (err: any) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/meals/${deleteId}`); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || 'Erreur'); }
    setConfirmOpen(false); setDeleteId(null);
  };

  const filtered = meals
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) && (!filterCat || String(m.category_id) === filterCat))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 px-8 h-16 flex items-center sticky top-0 z-20">
        <h1 className="font-headline text-2xl text-on-surface font-bold">Gestion des Repas</h1>
      </header>

      {/* Fixed Action Bar */}
      <div className="sticky top-16 z-10 bg-background border-b border-outline-variant/20 px-6 md:px-8 py-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center max-w-[1400px] mx-auto">
          <div className="relative flex-1 sm:max-w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" placeholder="Rechercher des repas..." />
          </div>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="appearance-none pl-4 pr-10 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary cursor-pointer">
            <option value="">Toutes les Catégories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={openCreate} className="bg-primary text-on-primary font-label-md text-label-md py-2 px-4 rounded-lg shadow-sm hover:bg-secondary transition-all flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[20px]">add</span> Ajouter un Nouveau Repas
          </button>
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-4 max-w-[1400px] mx-auto w-full">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-[5] bg-surface-container-low">
              <tr className="border-b border-outline-variant/30">
                <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider w-20">Image</th>
                <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Nom</th>
                <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Catégorie</th>
                <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right whitespace-nowrap">Prix</th>
                <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-center">Statut</th>
                <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {isLoading ? [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={6} className="py-4 px-4"><div className="h-12 bg-surface-container rounded animate-pulse" /></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-on-surface-variant">Aucun repas trouvé</td></tr>
              ) : filtered.map((meal) => (
                <tr key={meal.id} className="hover:bg-surface-container-highest/30 transition-colors group">
                  <td className="py-3 px-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container">
                      <img alt={meal.name} className="w-full h-full object-cover" src={meal.image || '/images/home/scallops-menu.jpg'} onError={(e) => { (e.target as HTMLImageElement).src = '/images/home/scallops-menu.jpg'; }} />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-on-surface">{meal.name}</div>
                    <div className="text-on-surface-variant text-[13px] mt-0.5 line-clamp-1">{meal.description}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md">{meal.category_name || '—'}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium font-label-md tabular-nums whitespace-nowrap">{Number(meal.price).toLocaleString()} Ar</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md font-label-sm text-[12px] font-semibold border ${meal.status === 'available' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                      {meal.status === 'available' ? 'Disponible' : 'Indisponible'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(meal)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Modifier">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => { setDeleteId(meal.id); setConfirmOpen(true); }} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors" title="Supprimer">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-[scaleIn_0.2s_ease_both] max-h-[90vh] overflow-y-auto">
            <h2 className="font-headline text-headline-md text-on-surface mb-4">{editMeal ? 'Modifier' : 'Ajouter'} un Repas</h2>
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">Image</label>
                <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 bg-surface-container-low border-2 border-dashed border-outline-variant/50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                  {formImage ? (
                    <img src={formImage} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-3xl text-outline-variant mb-1">add_photo_alternate</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Cliquer pour ajouter une image</span>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">Nom du repas</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" placeholder="Ex: Risotto aux truffes" />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">Catégorie</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:border-primary outline-none cursor-pointer">
                  <option value="">Sélectionner</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">Prix (Ar)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:border-primary outline-none tabular-nums" placeholder="Ex: 25000" />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:border-primary outline-none resize-none" placeholder="Description du repas" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">Annuler</button>
              <button onClick={handleSave} disabled={isSaving || !form.name.trim()} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-dark transition-colors disabled:opacity-50">{isSaving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={confirmOpen} title="Supprimer le repas" message="Cette action est irréversible. Voulez-vous vraiment supprimer ce repas ?" confirmText="Supprimer" onConfirm={handleDelete} onCancel={() => { setConfirmOpen(false); setDeleteId(null); }} danger />
    </div>
  );
};

export default AdminMeals;
