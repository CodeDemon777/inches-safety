import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      return await apiFetch('/admin/stats');
    },
  });
};
