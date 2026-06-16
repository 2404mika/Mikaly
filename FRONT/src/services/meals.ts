import api from './api';

export interface Meal {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: number;
  category_name?: string;
  status: string;
  is_featured: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  status: string;
  display_order: number;
}

const extractData = (response: any): any[] => {
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

export const getMeals = async (filters?: { category_id?: number }): Promise<Meal[]> => {
  const response = await api.get('/meals', { params: filters });
  return extractData(response);
};

export const getFeaturedMeals = async (): Promise<Meal[]> => {
  const response = await api.get('/meals');
  const meals = extractData(response);
  return meals.filter((meal: Meal) => Number(meal.is_featured) === 1);
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories');
  return extractData(response);
};
