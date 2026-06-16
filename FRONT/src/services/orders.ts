import api from './api';

export interface OrderItem {
  meal_id: number;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface Order {
  id: number;
  order_type: string;
  status: string;
  user_id: number;
  table_id: number | null;
  client_name: string;
  client_phone: string;
  delivery_address: string | null;
  delivery_fee: number;
  subtotal: number;
  total: number;
  notes: string | null;
  created_at: string;
  items?: OrderItem[];
}

export interface CreateOrderData {
  order_type: 'online' | 'takeaway';
  client_name: string;
  client_phone: string;
  delivery_address?: string;
  delivery_fee: number;
  items: OrderItem[];
  notes?: string;
}

export const createOrder = async (data: CreateOrderData): Promise<{ id: number; total: number }> => {
  console.log('[API] createOrder request:', data);
  const response = await api.post('/orders', data);
  console.log('[API] createOrder response:', response.data);
  return response.data.data;
};

export const getOrder = async (id: number): Promise<Order> => {
  const response = await api.get(`/orders/${id}`);
  return response.data.data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders');
  return response.data.data || [];
};

export const updateOrderStatus = async (id: number, status: string): Promise<void> => {
  await api.patch(`/orders/${id}/status`, { status });
};
