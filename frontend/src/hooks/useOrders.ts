import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export const useOrders = (enabled = true) => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      return await apiFetch('/orders/my-orders');
    },
    enabled,
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
