export function getMonthlyPaymentSummary(payments, monthCount = 6) {
  const now = new Date();
  const months = Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - monthCount + index + 1, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return {
      key,
      month: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      income: 0,
      expense: 0,
    };
  });
  const byMonth = new Map(months.map((month) => [month.key, month]));

  payments.forEach((payment) => {
    if (payment.status !== 'Paid' || !payment.date) return;
    const date = new Date(payment.date);
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const month = byMonth.get(key);
    if (!month) return;
    if (payment.type === 'Supplier') month.expense += Number(payment.amount) || 0;
    else month.income += Number(payment.amount) || 0;
  });

  return months;
}
