import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      return await apiFetch('/orders/my-orders');
    },
  });
};

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      return await apiFetch('/orders');
    },
  });
};
