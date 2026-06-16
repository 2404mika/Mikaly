import { useState, useEffect } from 'react';
import api from '../../services/api';
import AnimatedSection from '../../components/ui/AnimatedSection';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

interface User { id: number; name: string; email: string; phone: string; role: string; status: string; created_at: string; }

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  cook: 'bg-green-100 text-green-700 border-green-200',
  delivery: 'bg-blue-100 text-blue-700 border-blue-200',
  cashier: 'bg-amber-100 text-amber-700 border-amber-200',
  client: 'bg-gray-100 text-gray-600 border-gray-200',
};

const roleLabels: Record<string, string> = {
  admin: 'Admin', cook: 'Cuisinier', delivery: 'Livreur', cashier: 'Caissier', client: 'Client',
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'client' | 'staff'>('all');
  const [filterRole, setFilterRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'client' });
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try { const res = await api.get('/users'); setUsers(res.data.data || []); }
    catch {} finally { setIsLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => { setEditUser(null); setForm({ name: '', email: '', password: '', phone: '', role: 'cook' }); setShowModal(true); };
  const openEdit = (u: User) => { setEditUser(u); setForm({ name: u.name, email: u.email, password: '', phone: u.phone || '', role: u.role }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setIsSaving(true);
    try {
      if (editUser) {
        await api.put(`/users/${editUser.id}`, { name: form.name, phone: form.phone, role: form.role, status: editUser.status });
      } else {
        if (!form.password.trim()) { alert('Mot de passe requis'); setIsSaving(false); return; }
        await api.post('/users', { name: form.name, email: form.email, password: form.password, phone: form.phone, role: form.role });
      }
      setShowModal(false); fetchUsers();
    } catch (err: any) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/users/${deleteId}`); fetchUsers(); }
    catch (err: any) { alert(err.response?.data?.message || 'Erreur'); }
    setConfirmOpen(false); setDeleteId(null);
  };

  const filtered = users.filter((u) => {
    if (filterTab === 'client' && u.role !== 'client') return false;
    if (filterTab === 'staff' && u.role === 'client') return false;
    if (filterRole && u.role !== filterRole) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed Header */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 px-8 h-16 flex items-center justify-between sticky top-0 z-20">
        <h1 className="font-headline text-headline-lg text-on-surface">Gestion des Utilisateurs</h1>
      </header>

      {/* Fixed Action Bar */}
      <div className="sticky top-16 z-10 bg-background border-b border-outline-variant/20 px-6 md:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-[1400px] mx-auto">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={openCreate} className="bg-primary text-on-primary px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm hover:opacity-90 transition-all font-label-md text-label-md">
              <span className="material-symbols-outlined text-[18px]">person_add</span> Ajouter un Utilisateur
            </button>
            <div className="flex bg-surface-container rounded-lg p-1">
              {(['all', 'client', 'staff'] as const).map((tab) => (
                <button key={tab} onClick={() => setFilterTab(tab)} className={`px-4 py-1.5 rounded-md font-label-md text-label-md transition-all ${filterTab === tab ? 'bg-white shadow-sm text-primary font-bold' : 'hover:bg-white/50 text-on-surface-variant'}`}>
                  {tab === 'all' ? 'Tous' : tab === 'client' ? 'Clients' : 'Staff'}
                </button>
              ))}
            </div>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="bg-surface border border-outline-variant/30 rounded-lg px-4 py-2 text-body-sm font-label-md focus:border-primary cursor-pointer">
              <option value="">Tous les rôles</option>
              <option value="cook">Cuisinier</option>
              <option value="delivery">Livreur</option>
              <option value="cashier">Caissier</option>
              <option value="client">Client</option>
            </select>
          </div>
          <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">Total</p>
              <h3 className="font-headline text-headline-lg text-primary font-bold tabular-nums text-2xl">{users.length}</h3>
            </div>
            <div className="w-10 h-10 bg-secondary-container/30 rounded-full flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">groups</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-4 max-w-[1400px] mx-auto w-full">
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-[0_4px_12px_rgba(48,109,41,0.04)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-surface-container-low">
              <tr>
                <th className="px-6 py-3 text-label-md font-label-md text-on-surface-variant border-b border-outline-variant/20">Nom</th>
                <th className="px-6 py-3 text-label-md font-label-md text-on-surface-variant border-b border-outline-variant/20">Rôle</th>
                <th className="px-6 py-3 text-label-md font-label-md text-on-surface-variant border-b border-outline-variant/20">Téléphone</th>
                <th className="px-6 py-3 text-label-md font-label-md text-on-surface-variant border-b border-outline-variant/20">Email</th>
                <th className="px-6 py-3 text-label-md font-label-md text-on-surface-variant border-b border-outline-variant/20">Statut</th>
                <th className="px-6 py-3 text-label-md font-label-md text-on-surface-variant border-b border-outline-variant/20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {isLoading ? [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={6} className="py-4 px-6"><div className="h-10 bg-surface-container rounded animate-pulse" /></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-on-surface-variant">Aucun utilisateur trouvé</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container-lowest transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary font-bold text-sm">{u.name?.charAt(0) || '?'}</div>
                      <span className="font-label-md text-on-surface font-bold">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-label-sm font-medium border ${roleColors[u.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {roleLabels[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-body-sm text-on-surface-variant tabular-nums">{u.phone || '—'}</td>
                  <td className="px-6 py-4 text-body-sm text-on-surface-variant">{u.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                      <span className="text-label-sm font-semibold text-on-surface">{u.status === 'active' ? 'Actif' : 'Inactif'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(u)} className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Modifier">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => { setDeleteId(u.id); setConfirmOpen(true); }} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg transition-colors" title="Supprimer">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md shadow-2xl animate-[scaleIn_0.2s_ease_both]">
            <h2 className="font-headline text-headline-md text-on-surface mb-4">{editUser ? 'Modifier' : 'Ajouter'} un Utilisateur</h2>
            <div className="space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">Nom <span className='text-red-600 font-bold'>*</span></label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" placeholder="Nom complet" />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">Email </label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:border-primary outline-none" placeholder="email@exemple.com" disabled={!!editUser} required/>
              </div>
              {!editUser && (
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">Mot de passe <span className='text-red-600 font-bold'>*</span></label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:border-primary outline-none" placeholder="Mot de passe" />
                </div>
              )}
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">Téléphone <span className='text-red-600 font-bold'>*</span></label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:border-primary outline-none" placeholder="+261 34 00 000 00" />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">Rôle <span className='text-red-600 font-bold'>*</span></label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:border-primary outline-none cursor-pointer">
                  {/* <option value="client">Client</option> */}
                  <option value="cook">Cuisinier</option>
                  <option value="delivery">Livreur</option>
                  <option value="cashier">Caissier</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">Annuler</button>
              <button onClick={handleSave} disabled={isSaving || !form.name.trim()} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-dark transition-colors disabled:opacity-50">{isSaving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={confirmOpen} title="Supprimer l'utilisateur" message="Cette action est irréversible. Voulez-vous vraiment supprimer cet utilisateur ?" confirmText="Supprimer" onConfirm={handleDelete} onCancel={() => { setConfirmOpen(false); setDeleteId(null); }} danger />
    </div>
  );
};

export default AdminUsers;
