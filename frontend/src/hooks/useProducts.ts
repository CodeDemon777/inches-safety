import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export const useProducts = (category?: string) => {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      let queryUrl = '/products';
      if (category && category !== 'All') {
        queryUrl += `?category=${encodeURIComponent(category)}`;
      }
      return await apiFetch(queryUrl);
    },
  });
};

export const useAllProducts = () => {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      return await apiFetch('/products?all=true');
    },
  });
};
