export const validateQuote = (quote: {
  clientId: string; recipientSap?: string; delivery: string;
  lines: Array<{ productId: string; quantity: number; price: number }>;
}) => {
  const errors: string[] = [];
  if (!quote.clientId) errors.push('Seleccione un cliente.');
  if (!quote.recipientSap) errors.push('Seleccione un destinatario SAP.');
  if (!quote.delivery) errors.push('Confirme la fecha estimada de entrega.');
  if (!quote.lines.length) errors.push('Agregue al menos un producto.');
  quote.lines.forEach((line, index) => {
    if (!line.productId) errors.push(`Ítem ${index + 1}: seleccione un producto válido.`);
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) errors.push(`Ítem ${index + 1}: la cantidad debe ser mayor que cero.`);
    if (!Number.isFinite(line.price) || line.price <= 0) errors.push(`Ítem ${index + 1}: ingrese un precio válido.`);
  });
  return errors;
};
