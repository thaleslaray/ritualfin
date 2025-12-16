import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Import {
  id: string;
  couple_id: string;
  type: 'print' | 'ofx' | 'manual';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_name: string | null;
  file_url: string | null;
  file_hash: string | null;
  transactions_count: number | null;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

export function useImports() {
  const { coupleId } = useAuth();

  return useQuery({
    queryKey: ['imports', coupleId],
    queryFn: async () => {
      if (!coupleId) return [];
      
      const { data, error } = await supabase
        .from('imports')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Import[];
    },
    enabled: !!coupleId,
  });
}

export function useCreateImport() {
  const queryClient = useQueryClient();
  const { coupleId } = useAuth();

  return useMutation({
    mutationFn: async (importData: { type: 'print' | 'ofx'; file_name: string }) => {
      if (!coupleId) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('imports')
        .insert({ 
          ...importData, 
          couple_id: coupleId,
          status: 'pending' 
        })
        .select()
        .single();

      if (error) throw error;
      return data as Import;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
    },
    onError: (error) => {
      toast.error('Erro ao criar import: ' + error.message);
    },
  });
}

export function useUpdateImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Import> & { id: string }) => {
      const { data, error } = await supabase
        .from('imports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Import;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
    },
  });
}
