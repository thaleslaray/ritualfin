interface Transaction {
  merchant: string;
  amount: number;
  transaction_date: string;
  category: string | null;
}

interface CategoryBudget {
  category: string;
  planned_amount: number;
}

export function exportTransactionsToCsv(
  transactions: Transaction[],
  categoryBudgets: CategoryBudget[],
  monthName: string
) {
  // Build category planned amounts map
  const plannedByCategory: Record<string, number> = {};
  categoryBudgets.forEach(cb => {
    plannedByCategory[cb.category] = cb.planned_amount;
  });

  // Build actual amounts by category
  const actualByCategory: Record<string, number> = {};
  transactions.forEach(t => {
    if (t.category) {
      actualByCategory[t.category] = (actualByCategory[t.category] || 0) + Number(t.amount);
    }
  });

  // CSV Header
  const lines: string[] = [
    `Relatório Financeiro - ${monthName}`,
    '',
    'RESUMO POR CATEGORIA',
    'Categoria,Planejado,Real,Diferença',
  ];

  // Category summary
  const categories = Object.keys(plannedByCategory);
  let totalPlanned = 0;
  let totalActual = 0;

  categories.forEach(cat => {
    const planned = plannedByCategory[cat] || 0;
    const actual = actualByCategory[cat] || 0;
    const diff = planned - actual;
    totalPlanned += planned;
    totalActual += actual;
    
    lines.push(`${cat},${planned.toFixed(2)},${actual.toFixed(2)},${diff.toFixed(2)}`);
  });

  lines.push(`TOTAL,${totalPlanned.toFixed(2)},${totalActual.toFixed(2)},${(totalPlanned - totalActual).toFixed(2)}`);

  // Transaction details
  lines.push('');
  lines.push('TRANSAÇÕES DETALHADAS');
  lines.push('Data,Estabelecimento,Categoria,Valor');

  transactions.forEach(t => {
    const date = new Date(t.transaction_date).toLocaleDateString('pt-BR');
    const merchant = t.merchant.replace(/,/g, ' '); // Remove commas for CSV
    const category = t.category || 'Sem categoria';
    const amount = Number(t.amount).toFixed(2);
    
    lines.push(`${date},"${merchant}",${category},${amount}`);
  });

  // Create and download file
  const csvContent = lines.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio-${monthName.toLowerCase().replace(/\s/g, '-')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
