import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Card {
  id: string;
  couple_id: string;
  name: string;
  monthly_limit: number;
  closing_day: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useCards() {
  const { coupleId } = useAuth();

  return useQuery({
    queryKey: ['cards', coupleId],
    queryFn: async () => {
      if (!coupleId) return [];
      
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('couple_id', coupleId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Card[];
    },
    enabled: !!coupleId,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  const { coupleId } = useAuth();

  return useMutation({
    mutationFn: async (card: { name: string; monthly_limit: number; closing_day?: number }) => {
      if (!coupleId) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('cards')
        .insert({ ...card, couple_id: coupleId })
        .select()
        .single();

      if (error) throw error;
      return data as Card;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast.success('Cartão adicionado!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar cartão: ' + error.message);
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Card> & { id: string }) => {
      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Card;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cardId: string) => {
      const { error } = await supabase
        .from('cards')
        .update({ is_active: false })
        .eq('id', cardId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast.success('Cartão removido!');
    },
    onError: (error) => {
      toast.error('Erro ao remover cartão: ' + error.message);
    },
  });
}
