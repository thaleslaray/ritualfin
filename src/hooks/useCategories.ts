import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { normalizeCategoryName, slugifyCategoryKey } from '@/utils/categories';

export interface Category {
  id: string;
  couple_id: string;
  key: string;
  display_name: string;
  display_name_normalized: string;
  is_active: boolean;
  sort_order: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

async function getCoupleIdOrThrow(): Promise<string> {
  const { data, error } = await supabase.from('profiles').select('couple_id').single();
  if (error) throw error;
  if (!data?.couple_id) throw new Error('Perfil sem couple_id');
  return data.couple_id as string;
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('display_name', { ascending: true });

      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });
}

export function useActiveCategories() {
  return useQuery({
    queryKey: ['categories', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('display_name', { ascending: true });

      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ displayName }: { displayName: string }) => {
      const coupleId = await getCoupleIdOrThrow();

      const display_name = displayName.trim();
      const display_name_normalized = normalizeCategoryName(display_name);
      const key = slugifyCategoryKey(display_name);

      const { data, error } = await supabase
        .from('categories')
        .insert({
          couple_id: coupleId,
          key,
          display_name,
          display_name_normalized,
          is_active: true,
          sort_order: 0,
          is_default: false,
        })
        .select('*')
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria criada!');
    },
    onError: (error) => {
      toast.error('Erro ao criar categoria: ' + error.message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      displayName,
      isActive,
    }: {
      id: string;
      displayName?: string;
      isActive?: boolean;
    }) => {
      const patch: Partial<Pick<Category, 'display_name' | 'display_name_normalized' | 'is_active'>> = {};

      if (typeof displayName === 'string') {
        const display_name = displayName.trim();
        patch.display_name = display_name;
        patch.display_name_normalized = normalizeCategoryName(display_name);
      }

      if (typeof isActive === 'boolean') {
        patch.is_active = isActive;
      }

      const { data, error } = await supabase
        .from('categories')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria atualizada!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar categoria: ' + error.message);
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderedIds }: { orderedIds: string[] }) => {
      // Atualiza sort_order em lote (N updates). Para volumes pequenos de categorias, é ok.
      // Futuro: RPC SQL para atualizar em uma transação.
      const updates = orderedIds.map((id, idx) =>
        supabase.from('categories').update({ sort_order: idx }).eq('id', id),
      );

      const results = await Promise.all(updates);
      const firstError = results.find((r) => r.error)?.error;
      if (firstError) throw firstError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      toast.error('Erro ao reordenar categorias: ' + error.message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria excluída!');
    },
    onError: (error) => {
      // O trigger do banco usa mensagem "CATEGORY_IN_USE".
      const isInUse = /CATEGORY_IN_USE/i.test(error.message);
      toast.error(isInUse ? 'Categoria em uso — desative ao invés de excluir.' : 'Erro ao excluir categoria: ' + error.message);
    },
  });
}
