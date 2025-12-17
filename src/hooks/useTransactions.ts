import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface Transaction {
  id: string;
  month_id: string;
  import_id: string | null;
  card_id: string | null;
  merchant: string;
  merchant_normalized: string | null;
  amount: number;
  transaction_date: string;
  category: string | null;
  confidence: 'high' | 'medium' | 'low';
  is_internal_transfer: boolean;
  is_card_payment: boolean;
  fingerprint: string | null;
  source: 'print' | 'ofx' | 'manual';
  raw_data: Json | null;
  needs_review: boolean;
  created_at: string;
  updated_at: string;
}

export function useTransactions(monthId: string | undefined) {
  return useQuery({
    queryKey: ['transactions', monthId],
    queryFn: async () => {
      if (!monthId) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('month_id', monthId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!monthId,
  });
}

export function usePendingTransactions(monthId: string | undefined) {
  return useQuery({
    queryKey: ['pendingTransactions', monthId],
    queryFn: async () => {
      if (!monthId) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('month_id', monthId)
        .eq('needs_review', true)
        .order('confidence', { ascending: true })
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!monthId,
  });
}

// Normalize merchant for mapping storage
function normalizeMerchant(merchant: string): string {
  return merchant
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 50);
}

export function useCategorizeTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      transactionId, 
      category, 
      isInternalTransfer = false,
      merchantNormalized,
    }: { 
      transactionId: string; 
      category: string | null;
      isInternalTransfer?: boolean;
      merchantNormalized?: string | null;
    }) => {
      // Update the transaction
      const { data, error } = await supabase
        .from('transactions')
        .update({ 
          category,
          is_internal_transfer: isInternalTransfer,
          needs_review: false,
          confidence: 'high',
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;
      
      const transaction = data as Transaction;

      // Learn from this categorization - save merchant mapping for future auto-categorization
      // Only save if we have a category and merchant info (not internal transfers)
      if (category && !isInternalTransfer) {
        const normalizedMerchant = merchantNormalized || 
          (transaction.merchant_normalized) || 
          normalizeMerchant(transaction.merchant);
        
        if (normalizedMerchant && normalizedMerchant.length > 2) {
          // Get user's couple_id
          const { data: profile } = await supabase
            .from('profiles')
            .select('couple_id')
            .single();

          if (profile?.couple_id) {
            // Upsert the merchant mapping (insert or update usage_count)
            const { error: mappingError } = await supabase
              .from('merchant_mappings')
              .upsert({
                couple_id: profile.couple_id,
                merchant_normalized: normalizedMerchant,
                category: category,
                is_global: false,
                usage_count: 1,
              }, {
                onConflict: 'couple_id,merchant_normalized',
              });

            if (mappingError) {
              console.warn('Failed to save merchant mapping:', mappingError);
              // Don't throw - this is a background learning feature
            } else {
              console.log(`Learned: "${normalizedMerchant}" → ${category}`);
            }
          }
        }
      }

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions'] });
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;
      return data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions'] });
      toast.success('Transação adicionada!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar transação: ' + error.message);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions'] });
      toast.success('Transação removida!');
    },
    onError: (error) => {
      toast.error('Erro ao remover transação: ' + error.message);
    },
  });
}

export function useTransactionsSummary(monthId: string | undefined) {
  const { data: transactions } = useTransactions(monthId);

  const summary = {
    total: 0,
    byCategory: {} as Record<string, number>,
    pendingCount: 0,
    internalTransfers: 0,
  };

  if (transactions) {
    transactions.forEach(t => {
      if (t.is_internal_transfer || t.is_card_payment) {
        summary.internalTransfers += Number(t.amount);
        return;
      }

      summary.total += Number(t.amount);
      
      if (t.category) {
        summary.byCategory[t.category] = (summary.byCategory[t.category] || 0) + Number(t.amount);
      }
      
      if (t.needs_review) {
        summary.pendingCount++;
      }
    });
  }

  return summary;
}

export function useTransactionsByCategory(monthId: string | undefined, category: string | null) {
  return useQuery({
    queryKey: ['transactionsByCategory', monthId, category],
    queryFn: async () => {
      if (!monthId || !category) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('month_id', monthId)
        .eq('category', category)
        .eq('is_internal_transfer', false)
        .eq('is_card_payment', false)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!monthId && !!category,
  });
}
