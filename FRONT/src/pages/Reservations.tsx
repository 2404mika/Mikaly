import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvailableTables, createReservation } from '../services/reservations';
import AnimatedSection from '../components/ui/AnimatedSection';
import type { Table } from '../services/reservations';

const timeSlots = [
  '11:30', '12:00', '12:30', '13:00', '13:30',
  '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
];

const locationIcons: Record<string, string> = {
  'Salle principale': 'restaurant',
  'Terrasse': 'deck',
  'Salle VIP': 'star',
  'Bar': 'local_bar',
};

const Reservations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Pre-fill user info
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Fetch all available tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await getAvailableTables('all', 'all');
        setTables(data);
      } catch {
        // Fallback: fetch all tables
        try {
          const response = await fetch('/api/tables');
          const result = await response.json();
          setTables(result.data || []);
        } catch {
          setTables([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchTables();
  }, []);

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table);
    setError('');
  };

  const handleBack = () => {
    setSelectedTable(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate('/login');
      return;
    }

    if (!name.trim() || !phone.trim() || !date || !time) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);

    try {
      await createReservation({
        client_name: name,
        client_phone: phone,
        reservation_date: date,
        reservation_time: time,
        number_of_guests: guests,
        table_id: selectedTable?.id || undefined,
      });
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Step 2: Reservation Form
  if (selectedTable) {
    return (
      <main className="min-h-screen bg-background">
        <div className="w-full max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop py-8 pb-24 md:pb-8">
          <AnimatedSection animation="fadeUp">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-[color] duration-200 ease-out font-label-md text-label-md mb-6"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Retour aux tables
            </button>

            {/* Selected Table Card */}
            <div className="bg-primary/5 border-2 border-primary rounded-xl p-4 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined">table_restaurant</span>
              </div>
              <div className="flex-1">
                <h3 className="font-headline text-headline-sm text-on-surface">Table {selectedTable.table_number}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {selectedTable.capacity} places · {selectedTable.location}
                </p>
              </div>
              <button
                onClick={handleBack}
                className="text-on-surface-variant hover:text-error p-1 transition-[color] duration-150 ease-out"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Reservation Form */}
            <div className="bg-surface-container-lowest rounded-xl ambient-shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">event_seat</span>
                <h2 className="font-headline text-headline-md text-on-surface font-semibold">Réserver cette table</h2>
              </div>

              {error && (
                <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              {!user && (
                <div className="bg-amber-50 text-amber-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  <span>
                    <Link to="/login" className="font-medium underline">Connectez-vous</Link> pour réserver.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Nom complet *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ex: Jean Pierre"
                      required
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-[border-color,box-shadow] duration-200 ease-out"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Téléphone *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+261 34 XX XXX XX"
                      required
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-[border-color,box-shadow] duration-200 ease-out"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Date *</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={getTodayString()}
                        required
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-[border-color,box-shadow] duration-200 ease-out appearance-none"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">calendar_today</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Heure *</label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-[border-color,box-shadow] duration-200 ease-out appearance-none"
                    >
                      <option value="">Choisir une heure</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Nombre de personnes *</label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-12 h-12 flex items-center justify-center rounded-lg border border-outline-variant/30 hover:bg-surface-container transition-[background-color] duration-150 ease-out active:scale-95"
                      >
                        <span className="material-symbols-outlined">remove</span>
                      </button>
                      <span className="w-20 text-center font-headline text-headline-sm tabular-nums">{guests}</span>
                      <button
                        type="button"
                        onClick={() => setGuests(Math.min(selectedTable.capacity, guests + 1))}
                        className="w-12 h-12 flex items-center justify-center rounded-lg border border-outline-variant/30 hover:bg-surface-container transition-[background-color] duration-150 ease-out active:scale-95"
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        (max {selectedTable.capacity} places)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary">verified_user</span>
                    <p className="text-body-sm font-body-sm">Confirmation après validation</p>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-primary text-on-primary px-10 py-3 rounded-xl font-bold shadow-lg hover:shadow-primary/20 active:scale-95 transition-[transform,box-shadow] duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></span>
                        Traitement...
                      </>
                    ) : (
                      'Confirmer la Réservation'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </AnimatedSection>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-on-background/60 backdrop-blur-sm" onClick={() => { setShowSuccess(false); navigate('/'); }}></div>
            <div className="relative bg-surface-container-lowest w-full max-w-md rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center animate-[scaleIn_0.3s_ease_both]">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
              </div>
              <h2 className="font-headline text-headline-lg text-primary mb-2">Demande Reçue !</h2>
              <p className="text-body-md font-body-md text-on-surface-variant mb-8">
                Réservation table <strong>{selectedTable.table_number}</strong> pour <strong>{guests}</strong> personnes le <strong>{date}</strong> à <strong>{time}</strong>.
              </p>
              <button
                onClick={() => { setShowSuccess(false); navigate('/'); }}
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:shadow-lg transition-[box-shadow] duration-150 ease-out"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}
      </main>
    );
  }

  // Step 1: Tables Grid
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative w-full h-[300px] overflow-hidden flex items-center px-margin-desktop">
        <img className="absolute inset-0 w-full h-full object-cover" src="/images/home/hero-restaurant.jpg" alt="Restaurant" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent"></div>
        <div className="relative z-10 max-w-2xl">
          <AnimatedSection animation="fadeLeft">
            <h1 className="font-headline text-display-lg text-primary mb-4 leading-tight">
              Réservez votre table
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              Choisissez une table disponible puis complétez votre réservation.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Opening Hours Badge - Glassmorphism Fixed */}
      <div className="fixed top-20 right-4 z-50 backdrop-blur-md bg-white/30 border border-white/40 rounded-2xl shadow-2xl">
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">schedule</span>
            <span className="font-label-sm text-label-sm text-on-surface font-bold">Horaires</span>
          </div>
          <div className="font-label-xs text-label-xs text-on-surface-variant space-y-1">
            <p>Lun - Ven: 11h00 - 22h00</p>
            <p>Sam - Dim: 10h00 - 23h00</p>
          </div>
          <div className="border-t border-white/20 pt-2 flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-lg">location_on</span>
            <span className="font-label-xs text-label-xs text-on-surface-variant">Zoda, Anstenakely, Antsirabe</span>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <AnimatedSection animation="fadeUp">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-headline text-headline-lg text-on-surface mb-1">Tables disponibles</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {tables.length} table{tables.length > 1 ? 's' : ''} disponible{tables.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </AnimatedSection>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow-sm animate-pulse">
                <div className="w-14 h-14 bg-surface-container rounded-full mb-4"></div>
                <div className="h-5 bg-surface-container rounded w-16 mb-2"></div>
                <div className="h-4 bg-surface-container rounded w-24 mb-1"></div>
                <div className="h-4 bg-surface-container rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : tables.length === 0 ? (
          <AnimatedSection animation="scaleIn">
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-8xl text-outline-variant mb-4 block">table_restaurant</span>
              <h2 className="font-headline text-headline-md text-on-surface mb-2">Aucune table disponible</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Toutes les tables sont occupées. Réessayez plus tard.
              </p>
            </div>
          </AnimatedSection>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map((table, index) => (
              <AnimatedSection key={table.id} animation="scaleIn" delay={index * 60}>
                <button
                  onClick={() => handleSelectTable(table)}
                  className="w-full text-left bg-surface-container-lowest rounded-2xl p-6 ambient-shadow-sm hover:shadow-[0_12px_24px_rgba(48,109,41,0.1)] hover:-translate-y-1 transition-[transform,box-shadow] duration-200 ease-out group"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-[background-color] duration-200 ease-out">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      {locationIcons[table.location] || 'table_restaurant'}
                    </span>
                  </div>
                  <h3 className="font-headline text-headline-md text-on-surface mb-1">{table.table_number}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
                    {table.capacity} place{table.capacity > 1 ? 's' : ''} · {table.location}
                  </p>
                  <div className="flex items-center gap-1.5 text-primary font-label-sm text-label-sm">
                    <span>Réserver</span>
                    <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-[transform] duration-200 ease-out">arrow_forward</span>
                  </div>
                </button>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Reservations;
