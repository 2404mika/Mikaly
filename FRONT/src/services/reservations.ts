import api from './api';

export interface Table {
  id: number;
  table_number: string;
  capacity: number;
  status: string;
  location: string;
  qr_code: string;
}

export interface Reservation {
  id: number;
  client_name: string;
  client_phone: string;
  client_email: string;
  reservation_date: string;
  reservation_time: string;
  number_of_guests: number;
  table_id: number | null;
  table_number?: string;
  status: string;
  notes: string;
  user_id: number;
}

export const getAvailableTables = async (date: string, time: string): Promise<Table[]> => {
  const response = await api.get('/tables/available', { params: { date, time } });
  return response.data.data || [];
};

export const createReservation = async (data: {
  client_name: string;
  client_phone: string;
  reservation_date: string;
  reservation_time: string;
  number_of_guests: number;
  table_id?: number;
  notes?: string;
}): Promise<{ id: number }> => {
  const response = await api.post('/reservations', data);
  return response.data.data;
};

export const getMyReservations = async (): Promise<Reservation[]> => {
  const response = await api.get('/reservations/my-reservations');
  return response.data.data || [];
};

export const getAllReservations = async (): Promise<Reservation[]> => {
  const response = await api.get('/reservations/');
  return response.data.data || [];
};

export const updateReservationStatus = async (id: number, status: string, tableId?: number): Promise<void> => {
  await api.patch(`/reservations/${id}/status`, { status, table_id: tableId });
};
