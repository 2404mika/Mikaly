import { createContext, useContext, useState, ReactNode } from 'react';
import type { Meal } from '../services/meals';

export interface TableCartItem {
  meal: Meal;
  quantity: number;
  notes?: string;
}

interface TableCartContextType {
  items: TableCartItem[];
  addToCart: (meal: Meal, quantity?: number) => void;
  removeFromCart: (mealId: number) => void;
  updateQuantity: (mealId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const TableCartContext = createContext<TableCartContextType | undefined>(undefined);

export const TableCartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<TableCartItem[]>([]);

  const addToCart = (meal: Meal, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.meal.id === meal.id);
      if (existing) {
        return prev.map((item) =>
          item.meal.id === meal.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { meal, quantity }];
    });
  };

  const removeFromCart = (mealId: number) => {
    setItems((prev) => prev.filter((item) => item.meal.id !== mealId));
  };

  const updateQuantity = (mealId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(mealId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.meal.id === mealId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.meal.price * item.quantity,
    0
  );

  return (
    <TableCartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </TableCartContext.Provider>
  );
};

export const useTableCart = () => {
  const context = useContext(TableCartContext);
  if (!context) throw new Error('useTableCart must be used within TableCartProvider');
  return context;
};
