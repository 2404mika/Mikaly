import { useState, useEffect } from 'react';
import api from '../../services/api';
import AnimatedSection from '../../components/ui/AnimatedSection';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

interface Table { id: number; table_number: string; capacity: number; status: string; location: string; qr_code: string; }

const statusConfig: Record<string, { label: string; dot: string; bg: string; border: string }> = {
  free: { label: 'Libre', dot: 'bg-gray-400 border-2 border-gray-300', bg: 'bg-gray-50', border: 'border-gray-200' },
  occupied: { label: 'Occupée', dot: 'bg-green-600 border-2 border-green-400', bg: 'bg-green-50', border: 'border-green-300' },
  reserved: { label: 'Réservée', dot: 'bg-rose-500 border-2 border-rose-300', bg: 'bg-rose-50', border: 'border-rose-200' },
};

const AdminTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [networkIP, setNetworkIP] = useState('localhost');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [capacityError, setCapacityError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNumber, setEditNumber] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editCapacityError, setEditCapacityError] = useState('');

  const getNetworkUrl = () => {
    return `http://${networkIP}:3000/table-menu?tableId=`;
  };

  const fetchTables = async () => {
    try { const res = await api.get('/tables'); setTables(res.data.data || []); }
    catch {} finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchTables();
    // Récupérer l'IP réseau du serveur
    api.get('/network').then((res) => {
      setNetworkIP(res.data.ip);
    }).catch(() => {});
  }, []);

  const handleCapacityChange = (value: string, setter: (v: string) => void, errorSetter: (v: string) => void) => {
    setter(value);
    const num = Number(value);
    if (num > 10) errorSetter('Maximum 10 personnes');
    else errorSetter('');
  };

  const handleAdd = async () => {
    if (!newNumber.trim() || !newCapacity) return;
    if (Number(newCapacity) > 10) { setCapacityError('Maximum 10 personnes'); return; }
    setIsSaving(true);
    try {
      await api.post('/tables', { table_number: newNumber, capacity: Number(newCapacity), location: 'Salle Principale' });
      setNewNumber(''); setNewCapacity(''); setCapacityError(''); setShowAddForm(false);
      fetchTables();
    } catch (err: any) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setIsSaving(false); }
  };

  const handleEdit = async () => {
    if (!selectedTable || !editNumber.trim()) return;
    if (Number(editCapacity) > 10) { setEditCapacityError('Maximum 10 personnes'); return; }
    setIsSaving(true);
    try {
      await api.patch(`/tables/${selectedTable.id}/status`, {
        status: selectedTable.status,
        table_number: editNumber,
        capacity: Number(editCapacity),
      });
      setShowEditModal(false);
      fetchTables();
      setSelectedTable({ ...selectedTable, table_number: editNumber, capacity: Number(editCapacity) });
    } catch (err: any) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/tables/${deleteId}`); fetchTables(); setSelectedTable(null); }
    catch (err: any) { alert(err.response?.data?.message || 'Erreur'); }
    setConfirmDelete(false); setDeleteId(null);
  };

  const openEditModal = (table: Table) => {
    setEditNumber(table.table_number);
    setEditCapacity(String(table.capacity));
    setEditCapacityError('');
    setShowEditModal(true);
  };

  const generateQrPdf = (table: Table) => {
    const url = getNetworkUrl() + table.id;
    const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - Table ${table.table_number}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fff; }
          h1 { font-size: 56px; font-weight: 700; color: #306D29; margin-bottom: 8px; }
          .subtitle { font-size: 18px; color: #41493d; margin-bottom: 32px; }
          .qr-container { padding: 24px; border: 3px solid #306D29; border-radius: 16px; margin-bottom: 24px; display: inline-block; }
          .url { font-size: 11px; color: #717a6c; margin-top: 16px; word-break: break-all; }
          img { display: block; }
        </style>
      </head>
      <body>
        <h1>Table ${table.table_number}</h1>
        <p class="subtitle">${table.location || 'Restaurant'} — ${table.capacity} places</p>
        <div class="qr-container">
          <img src="${qrImgUrl}" width="300" height="300" alt="QR Code Table ${table.table_number}" />
        </div>
        <p class="url">${url}</p>
        <script>
          window.onload = function() { setTimeout(function() { window.print(); }, 800); };
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 px-8 h-16 flex items-center sticky top-0 z-20">
        <div>
          <h1 className="font-headline text-2xl text-on-surface font-bold">Gestion des Tables</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Salle Principale</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Table Form */}
          <AnimatedSection animation="fadeLeft">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm p-6">
              <h3 className="font-headline text-headline-md text-on-surface mb-4">Ajouter une Table</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">Numéro</label>
                  <input value={newNumber} onChange={(e) => setNewNumber(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" placeholder="Ex: T7" />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">Capacité (max 10)</label>
                  <input type="number" min="1" max="10" value={newCapacity} onChange={(e) => handleCapacityChange(e.target.value, setNewCapacity, setCapacityError)} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:border-primary outline-none" placeholder="Ex: 4" />
                  {capacityError && <p className="text-red-600 text-sm mt-1 font-medium">{capacityError}</p>}
                </div>
                <button onClick={handleAdd} disabled={isSaving || !newNumber.trim() || !newCapacity || !!capacityError} className="w-full bg-primary text-on-primary py-2.5 rounded-lg font-label-md text-label-md shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50">
                  {isSaving ? 'Ajout...' : 'Ajouter la Table'}
                </button>
              </div>
            </div>
          </AnimatedSection>

          {/* Tables Grid */}
          <div className="lg:col-span-2">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant/20">
                <h3 className="font-headline text-headline-md text-on-surface">Liste des Tables</h3>
                <div className="flex gap-3 items-center">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-gray-300"></div><span className="font-label-sm text-label-sm text-on-surface-variant">Libre</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-600 border-2 border-green-400"></div><span className="font-label-sm text-label-sm text-on-surface-variant">Occupée</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500 border-2 border-rose-300"></div><span className="font-label-sm text-label-sm text-on-surface-variant">Réservée</span></div>
                </div>
              </div>
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="bg-surface-container rounded-lg h-28 animate-pulse" />)}</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {tables.map((table) => {
                    const s = statusConfig[table.status] || statusConfig.free;
                    return (
                      <button key={table.id} onClick={() => setSelectedTable(table)}
                        type="button"
                        className={`${s.bg} ${s.border} border rounded-lg p-4 flex flex-col cursor-pointer hover:shadow-md transition-all text-left ${selectedTable?.id === table.id ? 'ring-2 ring-primary' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-headline text-headline-md text-on-surface">{table.table_number}</span>
                          <div className={`w-3 h-3 rounded-full ${s.dot}`}></div>
                        </div>
                        <div className="flex items-center gap-1 opacity-70">
                          <span className="material-symbols-outlined text-[16px]">person</span>
                          <span className="font-label-md text-label-md">{table.capacity} places</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedTable && (
        <>
          <div className="fixed inset-0 bg-on-background/20 backdrop-blur-sm z-40" onClick={() => setSelectedTable(null)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-surface border-l border-outline-variant/20 shadow-[-12px_0_24px_rgba(48,109,41,0.05)] z-50 flex flex-col animate-[fadeRight_0.3s_ease_both]">
            <div className="flex justify-between items-center p-5 border-b border-outline-variant/20">
              <h3 className="font-headline text-headline-md text-on-surface">Détails de la Table</h3>
              <button onClick={() => setSelectedTable(null)} className="p-1 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 mb-5">
                <div className={`w-4 h-4 rounded-full ${(statusConfig[selectedTable.status] || statusConfig.free).dot}`}></div>
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{(statusConfig[selectedTable.status] || statusConfig.free).label}</span>
              </div>

              <div className="bg-surface-container-low rounded-xl p-4 mb-5 border border-outline-variant/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Capacité</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-on-surface text-[18px]">person</span>
                    <span className="font-label-md text-label-md font-bold text-on-surface">{selectedTable.capacity} places</span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="border border-outline-variant/20 rounded-xl p-4 flex flex-col items-center justify-center bg-surface-container-lowest mb-5">
                <span className="font-label-md text-label-md text-on-surface mb-3">QR Code de la Table</span>
                <div className="w-32 h-32 bg-white border border-outline-variant/50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(getNetworkUrl() + selectedTable.id)}`}
                    alt={`QR Code ${selectedTable.table_number}`}
                    className="w-full h-full"
                  />
                </div>
                <p className="text-[10px] text-on-surface-variant text-center break-all mb-3 px-2">{getNetworkUrl()}{selectedTable.id}</p>
                <button onClick={() => generateQrPdf(selectedTable)} className="w-full py-2 border border-outline-variant text-on-surface font-label-sm text-label-sm rounded-lg hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span> Télécharger QR (PDF)
                </button>
              </div>

              <div className="space-y-2">
                <button onClick={() => openEditModal(selectedTable)} className="w-full py-2.5 border border-outline-variant text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">edit</span> Modifier
                </button>
                <button onClick={() => { setDeleteId(selectedTable.id); setConfirmDelete(true); }} className="w-full py-2.5 border border-error/30 text-error rounded-lg font-label-md text-label-md hover:bg-red-50 transition-colors flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">delete</span> Supprimer
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md shadow-2xl animate-[scaleIn_0.2s_ease_both]">
            <h2 className="font-headline text-headline-md text-on-surface mb-4">Modifier la Table</h2>
            <div className="space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">Numéro</label>
                <input value={editNumber} onChange={(e) => setEditNumber(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">Capacité (max 10)</label>
                <input type="number" min="1" max="10" value={editCapacity} onChange={(e) => handleCapacityChange(e.target.value, setEditCapacity, setEditCapacityError)} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:border-primary outline-none" />
                {editCapacityError && <p className="text-red-600 text-sm mt-1 font-medium">{editCapacityError}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">Annuler</button>
              <button onClick={handleEdit} disabled={isSaving || !!editCapacityError} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-dark transition-colors disabled:opacity-50">{isSaving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={confirmDelete} title="Supprimer la table" message="Cette action est irréversible. Voulez-vous vraiment supprimer cette table ?" confirmText="Supprimer" onConfirm={handleDelete} onCancel={() => { setConfirmDelete(false); setDeleteId(null); }} danger />
    </div>
  );
};

export default AdminTables;
