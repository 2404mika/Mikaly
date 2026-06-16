import { useState, useEffect } from 'react';
import api from '../../services/api';
import AnimatedSection from '../../components/ui/AnimatedSection';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import type { Reservation } from '../../services/reservations';

interface Table { id: number; table_number: string; capacity: number; status: string; location: string; qr_code: string; }

const statusConfig: Record<string, { label: string; dot: string; bg: string; border: string }> = {
  free: { label: 'Libre', dot: 'bg-gray-400 border-2 border-gray-300', bg: 'bg-gray-50', border: 'border-gray-200' },
  occupied: { label: 'Occupée', dot: 'bg-green-600 border-2 border-green-400', bg: 'bg-green-50', border: 'border-green-300' },
  reserved: { label: 'Réservée', dot: 'bg-rose-500 border-2 border-rose-300', bg: 'bg-rose-50', border: 'border-rose-200' },
};

const AdminTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tables' | 'reservations'>('tables');
  const [networkIP, setNetworkIP] = useState('localhost');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
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
  const [confirmReservation, setConfirmReservation] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const getNetworkUrl = () => {
    return `http://${networkIP}:3000/table-menu?tableId=`;
  };

  const fetchTables = async () => {
    try { const res = await api.get('/tables'); setTables(res.data.data || []); }
    catch {} finally { setIsLoading(false); }
  };

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations/');
      setReservations(res.data.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchTables();
    fetchReservations();
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
      setNewNumber(''); setNewCapacity(''); setCapacityError('');
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

  const openConfirmReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setConfirmReservation(true);
  };

  const handleConfirmReservation = async () => {
    if (!selectedReservation) return;
    setIsSaving(true);
    try {
      await api.patch(`/reservations/${selectedReservation.id}/status`, {
        status: 'confirmed',
        table_id: selectedReservation.table_id
      });
      if (selectedReservation.table_id) {
        await api.patch(`/tables/${selectedReservation.table_id}/status`, { status: 'reserved' });
      }
      fetchTables();
      fetchReservations();
      setConfirmReservation(false);
      setSelectedReservation(null);
    } catch (err: any) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setIsSaving(false); }
  };

  const handleCancelReservation = async (reservationId: number) => {
    try {
      await api.patch(`/reservations/${reservationId}/status`, { status: 'cancelled', table_id: null });
      fetchReservations();
    } catch (err: any) { alert(err.response?.data?.message || 'Erreur'); }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 px-8 h-16 flex items-center sticky top-0 z-20">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="font-headline text-2xl text-on-surface font-bold">Gestion des Tables</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Salle Principale</p>
          </div>
          <div className="flex gap-1 bg-surface-container rounded-lg p-1">
            <button onClick={() => setActiveTab('tables')} className={`px-4 py-1.5 rounded-md font-label-md text-label-md transition-all ${activeTab === 'tables' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
              Tables
            </button>
            <button onClick={() => setActiveTab('reservations')} className={`px-4 py-1.5 rounded-md font-label-md text-label-md transition-all flex items-center gap-2 ${activeTab === 'reservations' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
              Réservations
              {reservations.filter(r => r.status === 'pending').length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'reservations' ? 'bg-white/25' : 'bg-amber-500 text-white'}`}>
                  {reservations.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-[1400px] mx-auto w-full">
        {activeTab === 'tables' && (
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
      )}

      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant/20">
              <h3 className="font-headline text-headline-md text-on-surface">Réservations en attente</h3>
              <span className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full font-label-sm text-label-sm">
                {reservations.filter(r => r.status === 'pending').length} en attente
              </span>
            </div>
            {isLoading ? (
              <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-surface-container rounded-lg h-20 animate-pulse" />)}</div>
            ) : reservations.filter(r => r.status === 'pending').length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-outline-variant mb-3 block">event_available</span>
                <p className="font-body-md text-body-md text-on-surface-variant">Aucune réservation en attente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.filter(r => r.status === 'pending').sort((a, b) => new Date(a.reservation_date).getTime() - new Date(b.reservation_date).getTime()).map((reservation) => (
                  <div key={reservation.id} className="bg-surface rounded-xl border border-outline-variant/20 p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                          <span className="material-symbols-outlined text-amber-600 text-xl">event</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface font-medium">{reservation.client_name}</p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">phone</span>
                            {reservation.client_phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-amber-100 border border-amber-300 text-amber-700 px-2 py-0.5 rounded-full font-label-xs text-label-xs">
                          En attente
                        </span>
                        <span className="font-label-xs text-label-xs text-on-surface-variant">
                          #{reservation.id}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mb-4 pl-15">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_today</span>
                        <span className="font-label-sm text-label-sm text-on-surface">{new Date(reservation.reservation_date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">schedule</span>
                        <span className="font-label-sm text-label-sm text-on-surface">{reservation.reservation_time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
                        <span className="font-label-sm text-label-sm text-on-surface">{reservation.number_of_guests} personnes</span>
                      </div>
                    </div>
                    {reservation.notes && (
                      <p className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container rounded-lg p-2 mb-4 italic">"{reservation.notes}"</p>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => openConfirmReservation(reservation)} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-label-md text-label-md transition-colors flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Confirmer
                      </button>
                      <button onClick={() => handleCancelReservation(reservation.id)} className="py-2 px-4 border border-error/30 text-error hover:bg-red-50 rounded-lg font-label-md text-label-md transition-colors flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Confirmed Reservations */}
            {reservations.filter(r => r.status === 'confirmed').length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant/20">
                  <h3 className="font-headline text-headline-md text-on-surface">Réservations confirmées</h3>
                  <span className="bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full font-label-sm text-label-sm">
                    {reservations.filter(r => r.status === 'confirmed').length} confirmées
                  </span>
                </div>
                <div className="space-y-3">
                  {reservations.filter(r => r.status === 'confirmed').sort((a, b) => new Date(a.reservation_date).getTime() - new Date(b.reservation_date).getTime()).map((reservation) => (
                    <div key={reservation.id} className="bg-green-50/50 rounded-lg border border-green-100 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface font-medium">{reservation.client_name}</p>
                          <p className="font-label-xs text-label-xs text-on-surface-variant">
                            {new Date(reservation.reservation_date).toLocaleDateString('fr-FR')} · {reservation.reservation_time} · Table {reservation.table_number || 'Non assignée'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-label-xs text-label-xs text-on-surface-variant bg-surface px-2 py-1 rounded">{reservation.number_of_guests} pers.</span>
                        <button onClick={() => handleCancelReservation(reservation.id)} className="p-1.5 text-error/60 hover:text-error hover:bg-red-50 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-[18px]">cancel</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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

      {/* Confirm Reservation Modal */}
      {confirmReservation && selectedReservation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setConfirmReservation(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md shadow-2xl animate-[scaleIn_0.2s_ease_both]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline text-headline-md text-on-surface">Confirmer la réservation</h2>
              <button onClick={() => setConfirmReservation(false)} className="p-1 rounded-full hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            <div className="bg-surface-container rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Client</span>
                <span className="font-label-sm text-label-sm text-on-surface font-medium">{selectedReservation.client_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Téléphone</span>
                <span className="font-label-sm text-label-sm text-on-surface">{selectedReservation.client_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Date</span>
                <span className="font-label-sm text-label-sm text-on-surface">{new Date(selectedReservation.reservation_date).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Heure</span>
                <span className="font-label-sm text-label-sm text-on-surface">{selectedReservation.reservation_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Personnes</span>
                <span className="font-label-sm text-label-sm text-on-surface">{selectedReservation.number_of_guests}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Table choisie</span>
                <span className="font-label-sm text-label-sm text-on-surface font-medium">{selectedReservation.table_number || `Table #${selectedReservation.table_id}`}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmReservation(false)} className="px-4 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">Annuler</button>
              <button onClick={handleConfirmReservation} disabled={isSaving} className="px-4 py-2 bg-green-600 text-white rounded-lg font-label-md text-label-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Confirmer la réservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTables;
