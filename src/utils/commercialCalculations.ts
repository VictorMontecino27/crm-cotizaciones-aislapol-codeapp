export const quoteLineSubtotal = (quantity: number, price: number) => Math.max(0, Number(quantity) || 0) * Math.max(0, Number(price) || 0);
export const quoteLineTotal = (quantity: number, price: number, freight = 0) => quoteLineSubtotal(quantity, price) + Math.max(0, Number(freight) || 0);
export const quoteTotal = (lines: Array<{ quantity: number; price: number; freight?: number }>, exchangeRate = 1) =>
  lines.reduce((total, line) => total + quoteLineTotal(line.quantity, line.price, line.freight), 0) * Math.max(0, Number(exchangeRate) || 1);
export const cubicMeters = (length: number, width: number, height: number) =>
  Math.max(0, Number(length) || 0) * Math.max(0, Number(width) || 0) * Math.max(0, Number(height) || 0) / 1000000;

export const quoteExpiresOn = (createdAt: string, validity = 15) => {
  const date = new Date(`${createdAt}T12:00:00`);
  date.setDate(date.getDate() + Math.max(1, Number(validity) || 15));
  return date.toISOString().slice(0, 10);
};
