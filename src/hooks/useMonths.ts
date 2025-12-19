import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Month {
  id: string;
  couple_id: string;
  year_month: string;
  closed_at: string | null;
  edited_after_close: boolean;
  cloned_from: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryBudget {
  id: string;
  month_id: string;
  category: string;
  planned_amount: number;
  created_at: string;
  updated_at: string;
}

const FALLBACK_CATEGORY_KEYS = [
  'moradia',
  'alimentacao',
  'transporte',
  'saude',
  'lazer',
  'educacao',
  'vestuario',
  'outros',
];

async function getActiveCategoryKeysOrFallback(coupleId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('key')
      .eq('couple_id', coupleId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const keys = (data ?? []).map((d) => d.key as string).filter(Boolean);
    return keys.length > 0 ? keys : FALLBACK_CATEGORY_KEYS;
  } catch {
    // Se a migration de categories ainda não foi aplicada no ambiente, mantém o app funcional.
    return FALLBACK_CATEGORY_KEYS;
  }
}

export function useMonths() {
  const { coupleId } = useAuth();

  return useQuery({
    queryKey: ['months', coupleId],
    queryFn: async () => {
      if (!coupleId) return [];
      
      const { data, error } = await supabase
        .from('months')
        .select('*')
        .eq('couple_id', coupleId)
        .order('year_month', { ascending: false });

      if (error) throw error;
      return data as Month[];
    },
    enabled: !!coupleId,
  });
}

export function useCurrentMonth() {
  const { coupleId } = useAuth();
  const currentYearMonth = new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ['currentMonth', coupleId, currentYearMonth],
    queryFn: async () => {
      if (!coupleId) return null;
      
      const { data, error } = await supabase
        .from('months')
        .select('*')
        .eq('couple_id', coupleId)
        .eq('year_month', currentYearMonth)
        .maybeSingle();

      if (error) throw error;
      return data as Month | null;
    },
    enabled: !!coupleId,
  });
}

export function useCategoryBudgets(monthId: string | undefined) {
  return useQuery({
    queryKey: ['categoryBudgets', monthId],
    queryFn: async () => {
      if (!monthId) return [];
      
      const { data, error } = await supabase
        .from('category_budgets')
        .select('*')
        .eq('month_id', monthId);

      if (error) throw error;
      return data as CategoryBudget[];
    },
    enabled: !!monthId,
  });
}

export function useCreateMonth() {
  const queryClient = useQueryClient();
  const { coupleId } = useAuth();

  return useMutation({
    mutationFn: async (yearMonth: string) => {
      if (!coupleId) throw new Error('Não autenticado');

      // Create month
      const { data: month, error: monthError } = await supabase
        .from('months')
        .insert({ couple_id: coupleId, year_month: yearMonth })
        .select()
        .single();

      if (monthError) throw monthError;

      // Create category budgets (based on active categories)
      const activeCategoryKeys = await getActiveCategoryKeysOrFallback(coupleId);
      const categoryBudgets = activeCategoryKeys.map((category) => ({
        month_id: month.id,
        category,
        planned_amount: 0,
      }));

      const { error: budgetError } = await supabase
        .from('category_budgets')
        .insert(categoryBudgets);

      if (budgetError) throw budgetError;

      return month as Month;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['months'] });
      queryClient.invalidateQueries({ queryKey: ['currentMonth'] });
      toast.success('Mês criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar mês: ' + error.message);
    },
  });
}

export function useCloneMonth() {
  const queryClient = useQueryClient();
  const { coupleId } = useAuth();

  return useMutation({
    mutationFn: async ({ sourceMonthId, targetYearMonth }: { sourceMonthId: string; targetYearMonth: string }) => {
      if (!coupleId) throw new Error('Não autenticado');

      // Get source month budgets
      const { data: sourceBudgets, error: sourceError } = await supabase
        .from('category_budgets')
        .select('*')
        .eq('month_id', sourceMonthId);

      if (sourceError) throw sourceError;

      // Create new month
      const { data: newMonth, error: monthError } = await supabase
        .from('months')
        .insert({
          couple_id: coupleId,
          year_month: targetYearMonth,
          cloned_from: sourceMonthId,
        })
        .select()
        .single();

      if (monthError) throw monthError;

      // Clone category budgets
      const newBudgets = sourceBudgets.map(budget => ({
        month_id: newMonth.id,
        category: budget.category,
        planned_amount: budget.planned_amount,
      }));

      const { error: budgetError } = await supabase
        .from('category_budgets')
        .insert(newBudgets);

      if (budgetError) throw budgetError;

      return newMonth as Month;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['months'] });
      queryClient.invalidateQueries({ queryKey: ['currentMonth'] });
      toast.success('Mês clonado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao clonar mês: ' + error.message);
    },
  });
}

export function useCloseMonth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (monthId: string) => {
      const { data, error } = await supabase
        .from('months')
        .update({ closed_at: new Date().toISOString() })
        .eq('id', monthId)
        .select()
        .single();

      if (error) throw error;
      return data as Month;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['months'] });
      queryClient.invalidateQueries({ queryKey: ['currentMonth'] });
      toast.success('Mês fechado com sucesso! 🎉');
    },
    onError: (error) => {
      toast.error('Erro ao fechar mês: ' + error.message);
    },
  });
}

export function useUpdateCategoryBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, planned_amount }: { id: string; planned_amount: number }) => {
      const { data, error } = await supabase
        .from('category_budgets')
        .update({ planned_amount })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CategoryBudget;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categoryBudgets'] });
    },
  });
}
