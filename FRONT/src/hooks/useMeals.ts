import { useState, useEffect } from 'react';
import type { Meal, Category } from '../services/meals';
import { getFeaturedMeals, getMeals, getCategories } from '../services/meals';

export const useFeaturedMeals = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const data = await getFeaturedMeals();
        setMeals(data);
      } catch {
        setError('Erreur lors du chargement des plats');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeals();
  }, []);

  return { meals, isLoading, error };
};

export const useMeals = (categoryId?: number) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const data = await getMeals(categoryId ? { category_id: categoryId } : undefined);
        setMeals(data);
      } catch {
        setError('Erreur lors du chargement des plats');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeals();
  }, [categoryId]);

  return { meals, isLoading, error };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch {
        console.error('Erreur lors du chargement des catégories');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return { categories, isLoading };
};
