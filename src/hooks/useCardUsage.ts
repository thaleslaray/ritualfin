import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCards } from './useCards';

interface CardUsage {
  cardId: string;
  cardName: string;
  monthlyLimit: number;
  totalSpent: number;
  percentage: number;
  isOverLimit: boolean;
}

export function useCardUsage(monthId: string | undefined) {
  const { data: cards } = useCards();

  return useQuery({
    queryKey: ['cardUsage', monthId, cards?.map(c => c.id)],
    queryFn: async () => {
      if (!monthId || !cards || cards.length === 0) return [];

      // Get all transactions for this month that have a card_id
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('card_id, amount')
        .eq('month_id', monthId)
        .eq('is_internal_transfer', false)
        .eq('is_card_payment', false)
        .not('card_id', 'is', null);

      if (error) throw error;

      // Calculate usage per card
      const usageByCard: Record<string, number> = {};
      transactions?.forEach(t => {
        if (t.card_id) {
          usageByCard[t.card_id] = (usageByCard[t.card_id] || 0) + Number(t.amount);
        }
      });

      // Map to card usage objects
      const cardUsage: CardUsage[] = cards.map(card => {
        const totalSpent = usageByCard[card.id] || 0;
        const percentage = card.monthly_limit > 0 
          ? Math.round((totalSpent / card.monthly_limit) * 100) 
          : 0;
        
        return {
          cardId: card.id,
          cardName: card.name,
          monthlyLimit: card.monthly_limit,
          totalSpent,
          percentage,
          isOverLimit: totalSpent > card.monthly_limit,
        };
      });

      return cardUsage;
    },
    enabled: !!monthId && !!cards && cards.length > 0,
  });
}
