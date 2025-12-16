import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface RecurringBill {
  id: string;
  couple_id: string;
  name: string;
  amount: number;
  due_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useRecurringBills() {
  const { coupleId } = useAuth();

  return useQuery({
    queryKey: ['recurringBills', coupleId],
    queryFn: async () => {
      if (!coupleId) return [];
      
      const { data, error } = await supabase
        .from('recurring_bills')
        .select('*')
        .eq('couple_id', coupleId)
        .eq('is_active', true)
        .order('due_day');

      if (error) throw error;
      return data as RecurringBill[];
    },
    enabled: !!coupleId,
  });
}

export function useCreateRecurringBill() {
  const queryClient = useQueryClient();
  const { coupleId } = useAuth();

  return useMutation({
    mutationFn: async (bill: { name: string; amount: number; due_day: number }) => {
      if (!coupleId) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('recurring_bills')
        .insert({ ...bill, couple_id: coupleId })
        .select()
        .single();

      if (error) throw error;
      return data as RecurringBill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringBills'] });
      toast.success('Conta adicionada!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar conta: ' + error.message);
    },
  });
}

export function useUpdateRecurringBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RecurringBill> & { id: string }) => {
      const { data, error } = await supabase
        .from('recurring_bills')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as RecurringBill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringBills'] });
    },
  });
}

export function useDeleteRecurringBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (billId: string) => {
      const { error } = await supabase
        .from('recurring_bills')
        .update({ is_active: false })
        .eq('id', billId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringBills'] });
      toast.success('Conta removida!');
    },
    onError: (error) => {
      toast.error('Erro ao remover conta: ' + error.message);
    },
  });
}
