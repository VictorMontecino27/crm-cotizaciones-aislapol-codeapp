import { useEffect, useMemo, useState } from 'react';
import { commercialRepository } from '../../services/commercialRepository';
import { cubicMeters, quoteExpiresOn, quoteTotal } from '../../utils/commercialCalculations';
import type { AgreedPrice, Client, CommercialQuote, Freight, Opportunity, Product, QuoteLine } from '../../types/commercial';

const money = (value: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0);
const today = () => new Date().toISOString().slice(0, 10);
const statusOptions = ['Todas', 'Borrador', 'Revisar', 'Pendiente aprobación de precio', 'Enviada', 'Aceptada', 'Pedido pendiente de integración', 'Ingresado SAP', 'Completada', 'Vencida'];

const newLine = (): QuoteLine => ({ productId: '', quantity: 1, saleUnit: 'PZA', price: 0, margin: 15, freight: 0, baseUnit: 'PZA', length: 0, width: 0, height: 0 });

export function QuotesWorkspace() {
  const [quotes, setQuotes] = useState<CommercialQuote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [agreements, setAgreements] = useState<AgreedPrice[]>([]);
  const [freights, setFreights] = useState<Freight[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todas');
  const [period, setPeriod] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [expiredOnly, setExpiredOnly] = useState(false);
  const [selected, setSelected] = useState<CommercialQuote | null>(null);
  const [editing, setEditing] = useState<CommercialQuote | null>(null);

  useEffect(() => {
    void Promise.all([
      commercialRepository.quotes(), commercialRepository.clients(), commercialRepository.products(),
      commercialRepository.agreedPrices(), commercialRepository.freights(), commercialRepository.opportunities(),
    ]).then(([q, c, p, a, f, o]) => {
      setQuotes(q); setClients(c); setProducts(p); setAgreements(a); setFreights(f); setOpportunities(o);
    });
  }, []);

  const visible = useMemo(() => quotes.filter(quote => {
    const client = clients.find(item => item.id === quote.clientId);
    const matchesSearch = `${quote.id} ${client?.name || ''} ${client?.rut || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'Todas' || quote.status === status;
    const matchesClient = !clientFilter || quote.clientId === clientFilter;
    const matchesPeriod = !period || quote.createdAt.startsWith(period);
    const matchesExpired = !expiredOnly || Boolean(quote.expiresAt && quote.expiresAt < today());
    return matchesSearch && matchesStatus && matchesClient && matchesPeriod && matchesExpired;
  }), [quotes, clients, search, status, clientFilter, period, expiredOnly]);

  if (editing) {
    return <QuoteEditor
      quote={editing}
      clients={clients}
      products={products}
      agreements={agreements}
      freights={freights}
      opportunities={opportunities}
      onCancel={() => setEditing(null)}
      onSave={quote => {
        setQuotes(items => items.some(item => item.id === quote.id) ? items.map(item => item.id === quote.id ? quote : item) : [quote, ...items]);
        setEditing(null);
        setSelected(quote);
      }}
    />;
  }

  if (selected) {
    return <QuoteDetail quote={selected} client={clients.find(item => item.id === selected.clientId)}
      products={products} onBack={() => setSelected(null)}
      onEdit={() => setEditing(selected)}
      onRevise={() => setEditing(revision(selected, quotes))} />;
  }

  const createQuote = () => {
    const number = Math.max(0, ...quotes.map(item => Number(String(item.id).match(/(\d+)$/)?.[1] || 0))) + 1;
    const id = `CT-${String(number).padStart(4, '0')}`;
    setEditing({
      id, version: 1, clientId: '', recipient: '', recipientSap: '', contact: '', email: '', phone: '',
      status: 'Borrador', currency: 'CLP', exchangeRate: 1, payment: 'CONTADO',
      delivery: '', validity: '15', notes: '', lines: [newLine()], createdAt: today(),
      plant: 'PTS1', shipping: 'retiro', deliveryMode: 'unica', freightPayer: 'cliente', expiresAt: quoteExpiresOn(today(), 15),
    });
  };

  return <>
    <section className="moduleIntro"><div><span className="moduleEyebrow">Comercial</span><h1>Cotizaciones</h1><p>Busca, revisa, crea y realiza seguimiento de propuestas comerciales.</p></div><button className="primary" onClick={createQuote}>＋ Nueva cotización</button></section>
    <section className="card moduleCard">
      <div className="moduleFilters quoteFilters">
        <label><span>Buscar</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Correlativo, cliente o RUT" /></label>
        <label><span>Cliente</span><select value={clientFilter} onChange={event => setClientFilter(event.target.value)}><option value="">Todos los clientes</option>{clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
        <label><span>Estado</span><select value={status} onChange={event => setStatus(event.target.value)}>{statusOptions.map(item => <option key={item}>{item}</option>)}</select></label>
        <label><span>Período</span><input type="month" value={period} onChange={event => setPeriod(event.target.value)} /></label>
        <label className="checkLabel"><input type="checkbox" checked={expiredOnly} onChange={event => setExpiredOnly(event.target.checked)} />Sólo vencidas</label>
      </div>
      <p className="tableMeta">{visible.length} cotizaciones encontradas.</p>
      <div className="tableScroll"><table><thead><tr><th>Correlativo</th><th>Versión</th><th>Cliente</th><th>Creación</th><th>Entrega</th><th>Total</th><th>Estado</th><th /></tr></thead>
        <tbody>{visible.map(quote => {
          const client = clients.find(item => item.id === quote.clientId);
          return <tr key={quote.id} className="clickableRow" onClick={() => setSelected(quote)}>
            <td><strong>{quote.id}</strong></td><td>V{quote.version}</td><td>{client?.name || quote.clientId}</td>
            <td>{quote.createdAt}</td><td>{quote.delivery || 'Pendiente'}</td><td>{money(quoteTotal(quote.lines, quote.exchangeRate))}</td>
            <td><span className={`statusBadge status-${quoteStatusClass(quote.status)}`}>{quote.status}</span></td><td><button className="textButton">Abrir</button></td>
          </tr>;
        })}{!visible.length && <tr><td colSpan={8}>No hay cotizaciones para los filtros seleccionados.</td></tr>}</tbody>
      </table></div>
    </section>
  </>;
}

function revision(source: CommercialQuote, quotes: CommercialQuote[]): CommercialQuote {
  const root = source.rootQuoteId || source.id.replace(/-V\d+$/, '');
  const next = Math.max(1, ...quotes.filter(item => (item.rootQuoteId || item.id).replace(/-V\d+$/, '') === root).map(item => item.version || 1)) + 1;
  return { ...source, id: `${root}-V${next}`, rootQuoteId: root, version: next, status: 'Borrador', createdAt: today(), lines: source.lines.map(line => ({ ...line })) };
}

function quoteStatusClass(status: string) {
  if (status === 'Ingresado SAP' || status === 'Completada') return 'success';
  if (status === 'Vencida') return 'danger';
  if (status.includes('Pendiente') || status === 'Revisar') return 'warning';
  if (status === 'Enviada' || status === 'Aceptada') return 'info';
  return 'neutral';
}

function QuoteEditor({ quote, clients, products, agreements, freights, opportunities, onCancel, onSave }: {
  quote: CommercialQuote; clients: Client[]; products: Product[]; agreements: AgreedPrice[]; freights: Freight[]; opportunities: Opportunity[];
  onCancel: () => void; onSave: (quote: CommercialQuote) => void;
}) {
  const [draft, setDraft] = useState<CommercialQuote>(quote);
  const [errors, setErrors] = useState<string[]>([]);
  const client = clients.find(item => item.id === draft.clientId);
  const clientOpportunities = opportunities.filter(item => item.clientId === draft.clientId);

  const updateClient = (clientId: string) => {
    const next = clients.find(item => item.id === clientId);
    const recipient = next?.recipients.find(item => item.active);
    const contact = next?.contacts.find(item => item.active);
    setDraft(current => ({
      ...current, clientId, recipient: recipient?.name || '', recipientSap: recipient?.shipToParty || '',
      contact: contact?.name || next?.contact || '', email: contact?.email || next?.email || '', phone: contact?.phone || next?.phone || '',
      billingAddress: next?.address || '', deliveryAddress: recipient?.address || next?.address || '',
      payment: next?.payment || 'CONTADO',
    }));
  };

  const updateLine = (index: number, values: Partial<QuoteLine>) => {
    setDraft(current => ({ ...current, lines: current.lines.map((line, lineIndex) => lineIndex === index ? { ...line, ...values } : line) }));
  };
  const selectProduct = (index: number, productId: string) => {
    const product = products.find(item => item.id === productId);
    const agreement = agreements.find(item => item.clientId === draft.clientId && item.productId === productId && item.status !== 'Vencido');
    updateLine(index, { productId, saleUnit: product?.unit || 'PZA', baseUnit: product?.unit || 'PZA', price: agreement?.price || product?.cost && product.cost * 1.35 || 0, priceSource: agreement ? 'Precio acordado vigente' : 'Lista de precios' });
  };
  const total = quoteTotal(draft.lines, draft.exchangeRate);
  const save = (status: CommercialQuote['status']) => {
    const validation: string[] = [];
    if (!draft.clientId) validation.push('Seleccione un cliente.');
    if (!draft.recipientSap) validation.push('Seleccione un destinatario SAP.');
    if (!draft.delivery) validation.push('Confirme la fecha estimada de entrega.');
    if (!draft.lines.length) validation.push('Agregue al menos un producto.');
    draft.lines.forEach((line, index) => {
      if (!line.productId) validation.push(`Ítem ${index + 1}: seleccione un producto válido.`);
      if (!Number.isFinite(line.quantity) || line.quantity <= 0) validation.push(`Ítem ${index + 1}: la cantidad debe ser mayor que cero.`);
      if (line.price <= 0) validation.push(`Ítem ${index + 1}: ingrese un precio válido.`);
    });
    if (validation.length) { setErrors(validation); return; }
    onSave({ ...draft, status, expiresAt: quoteExpiresOn(draft.createdAt, Number(draft.validity) || 15) });
  };

  return <>
    <section className="moduleIntro"><div><span className="moduleEyebrow">Comercial</span><h1>{draft.id}</h1><p>{draft.version > 1 ? `Versión ${draft.version}` : 'Nueva cotización'}</p></div><button className="secondary" onClick={onCancel}>Cancelar</button></section>
    {errors.length > 0 && <div className="quoteValidation" role="alert">{errors.map(error => <div key={error}>{error}</div>)}</div>}
    <section className="card moduleCard quoteEditor">
      <div className="formGrid">
        <label>Cliente<select value={draft.clientId} onChange={event => updateClient(event.target.value)}><option value="">Seleccione cliente</option>{clients.map(item => <option key={item.id} value={item.id}>{item.sapId} · {item.name}</option>)}</select></label>
        <label>Destinatario SAP<select value={draft.recipientSap} onChange={event => { const recipient = client?.recipients.find(item => item.shipToParty === event.target.value); setDraft(current => ({ ...current, recipientSap: event.target.value, recipient: recipient?.name || '', deliveryAddress: recipient?.address || current.deliveryAddress })); }}><option value="">Seleccione destinatario</option>{client?.recipients.filter(item => item.active).map(item => <option key={item.shipToParty} value={item.shipToParty}>{item.shipToParty} · {item.name}</option>)}</select></label>
        <label>Contacto<select value={draft.contact} onChange={event => { const contact = client?.contacts.find(item => item.name === event.target.value); setDraft(current => ({ ...current, contact: event.target.value, email: contact?.email || current.email, phone: contact?.phone || current.phone })); }}><option value="">Seleccione contacto</option>{client?.contacts.filter(item => item.active).map(item => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
        <label>Oportunidad<select value={draft.opportunityId || ''} onChange={event => setDraft(current => ({ ...current, opportunityId: event.target.value }))}><option value="">Sin oportunidad</option>{clientOpportunities.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Correo<input value={draft.email || ''} onChange={event => setDraft(current => ({ ...current, email: event.target.value }))} /></label>
        <label>Teléfono<input value={draft.phone || ''} onChange={event => setDraft(current => ({ ...current, phone: event.target.value }))} /></label>
        <label>Planta<select value={draft.plant || 'PTS1'} onChange={event => setDraft(current => ({ ...current, plant: event.target.value }))}><option>PTS1</option><option>PTS2</option><option>PTS3</option></select></label>
        <label>Moneda<select value={draft.currency} onChange={event => setDraft(current => ({ ...current, currency: event.target.value, exchangeRate: event.target.value === 'CLP' ? 1 : current.exchangeRate }))}><option>CLP</option><option>USD</option><option>UF</option></select></label>
        <label>Tipo de cambio<input type="number" min="0" value={draft.exchangeRate} onChange={event => setDraft(current => ({ ...current, exchangeRate: Number(event.target.value) || 0 }))} /></label>
        <label>Condición de pago<select value={draft.payment} onChange={event => setDraft(current => ({ ...current, payment: event.target.value }))}><option>CONTADO</option><option>C15</option><option>C30</option><option>C60</option><option>C90</option></select></label>
        <label>Entrega<select value={draft.deliveryMode || 'unica'} onChange={event => setDraft(current => ({ ...current, deliveryMode: event.target.value as 'unica' | 'parcializada' }))}><option value="unica">Única</option><option value="parcializada">Parcializada</option></select></label>
        <label>Modalidad de despacho<select value={draft.shipping || 'retiro'} onChange={event => setDraft(current => ({ ...current, shipping: event.target.value as 'retiro' | 'despacho' }))}><option value="retiro">Retiro en planta</option><option value="despacho">Despacho</option></select></label>
        <label>Pagador del flete<select value={draft.freightPayer || 'cliente'} onChange={event => setDraft(current => ({ ...current, freightPayer: event.target.value as 'cliente' | 'empresa' }))}><option value="cliente">Cliente</option><option value="empresa">Empresa</option></select></label>
        <label>Fecha de entrega<input type="date" value={draft.delivery} onChange={event => setDraft(current => ({ ...current, delivery: event.target.value }))} /></label>
        <label>Validez (días)<select value={draft.validity} onChange={event => setDraft(current => ({ ...current, validity: event.target.value }))}><option value="15">15</option><option value="20">20</option><option value="25">25</option><option value="30">30</option></select></label>
        <label>Dirección de facturación<input value={draft.billingAddress || ''} onChange={event => setDraft(current => ({ ...current, billingAddress: event.target.value }))} /></label>
        <label>Dirección de despacho<input value={draft.deliveryAddress || ''} onChange={event => setDraft(current => ({ ...current, deliveryAddress: event.target.value }))} /></label>
        <label className="fullField">Observaciones<textarea value={draft.notes} onChange={event => setDraft(current => ({ ...current, notes: event.target.value }))} /></label>
      </div>
      <div className="quoteLineHeading"><h2>Líneas de producto</h2><button className="secondary" onClick={() => setDraft(current => ({ ...current, lines: [...current.lines, newLine()] }))}>＋ Agregar línea</button></div>
      {draft.lines.map((line, index) => {
        const product = products.find(item => item.id === line.productId);
        const cubic = cubicMeters(line.length || 0, line.width || 0, line.height || 0);
        return <div className="quoteLineCard" key={index}>
          <div className="formGrid">
            <label>Producto<select value={line.productId} onChange={event => selectProduct(index, event.target.value)}><option value="">Seleccione producto</option>{products.map(item => <option key={item.id} value={item.id}>{item.id} · {item.description}</option>)}</select></label>
            <label>Cantidad<input type="number" min="1" value={line.quantity} onChange={event => updateLine(index, { quantity: Number(event.target.value) })} /></label>
            <label>Unidad<select value={line.saleUnit} onChange={event => updateLine(index, { saleUnit: event.target.value })}><option>PZA</option><option>PAC</option><option>M2</option><option>M3</option><option>CJ</option></select></label>
            <label>Precio unitario<input type="number" min="0" value={line.price} onChange={event => updateLine(index, { price: Number(event.target.value) })} /></label>
            <label>Margen %<input type="number" min="0" max="100" value={line.margin} onChange={event => updateLine(index, { margin: Number(event.target.value) })} /></label>
            <label>Flete<input type="number" min="0" value={line.freight} onChange={event => updateLine(index, { freight: Number(event.target.value) })} /></label>
            {product?.unit === 'M2' && <><label>Largo mm<input type="number" value={line.length || ''} onChange={event => updateLine(index, { length: Number(event.target.value) })} /></label><label>Ancho mm<input type="number" value={line.width || ''} onChange={event => updateLine(index, { width: Number(event.target.value) })} /></label></>}
            {product?.unit === 'PZA' && <><label>Largo mm<input type="number" value={line.length || ''} onChange={event => updateLine(index, { length: Number(event.target.value) })} /></label><label>Ancho mm<input type="number" value={line.width || ''} onChange={event => updateLine(index, { width: Number(event.target.value) })} /></label><label>Alto mm<input type="number" value={line.height || ''} onChange={event => updateLine(index, { height: Number(event.target.value) })} /></label></>}
          </div>
          <div className="quoteLineResult"><span>Fuente: {line.priceSource || 'No definida'}</span><strong>{money(line.quantity * line.price + line.freight)}</strong>{cubic > 0 && <span>Cubicación: {cubic.toFixed(3)} m³ por pieza</span>}<button className="textButton" onClick={() => setDraft(current => ({ ...current, lines: current.lines.filter((_, itemIndex) => itemIndex !== index) }))}>Eliminar línea</button></div>
        </div>;
      })}
      <div className="quoteSummary"><div><span>Subtotal</span><strong>{money(total)}</strong></div><div><span>Flete</span><strong>{money(draft.lines.reduce((sum, line) => sum + line.freight, 0))}</strong></div><div><span>Total estimado</span><strong>{money(total)}</strong></div><button className="secondary" onClick={() => save('Borrador')}>Guardar borrador</button><button className="primary" onClick={() => save('Revisar')}>Guardar cotización</button></div>
      {draft.shipping === 'despacho' && freights.length > 0 && <p className="quoteHint">Tarifa simulada disponible para el destino: {freights.find(item => item.destination === draft.destination)?.rate || freights[0].rate ? money(freights[0].rate) : 'Pendiente de integración'}</p>}
    </section>
  </>;
}

function QuoteDetail({ quote, client, products, onBack, onEdit, onRevise }: {
  quote: CommercialQuote; client?: Client; products: Product[]; onBack: () => void; onEdit: () => void; onRevise: () => void;
}) {
  return <>
    <section className="moduleIntro"><div><span className="moduleEyebrow">Detalle de cotización</span><h1>{quote.id}</h1><p>Versión {quote.version} · {quote.status}</p></div><div className="clientMasterActions"><button className="secondary" onClick={onBack}>Volver al listado</button><button className="secondary" onClick={onEdit}>Editar</button><button className="primary" onClick={onRevise}>Crear revisión</button></div></section>
    <section className="card moduleCard">
      <div className="detailGrid"><div><span>Cliente</span><strong>{client?.name || quote.clientId}</strong></div><div><span>Destinatario</span><strong>{quote.recipient}</strong></div><div><span>Contacto</span><strong>{quote.contact}</strong></div><div><span>Planta</span><strong>{quote.plant || 'PTS1'}</strong></div><div><span>Moneda</span><strong>{quote.currency}</strong></div><div><span>Condición de pago</span><strong>{quote.payment}</strong></div><div><span>Entrega</span><strong>{quote.delivery || 'Pendiente'}</strong></div><div><span>Validez</span><strong>{quote.validity} días</strong></div><div><span>Vigencia hasta</span><strong>{quote.expiresAt || quoteExpiresOn(quote.createdAt, Number(quote.validity) || 15)}</strong></div></div>
      <div className="tableScroll"><table><thead><tr><th>Producto</th><th>Descripción</th><th>Cantidad</th><th>Unidad</th><th>Precio</th><th>Margen</th><th>Total línea</th></tr></thead><tbody>{quote.lines.map((line, index) => {
        const product = products.find(item => item.id === line.productId);
        return <tr key={index}><td>{line.productId}</td><td>{product?.description || 'Producto pendiente'}</td><td>{line.quantity}</td><td>{line.saleUnit}</td><td>{money(line.price)}</td><td>{line.margin}%</td><td>{money(line.quantity * line.price + line.freight)}</td></tr>;
      })}</tbody></table></div>
      <div className="quoteDetailNotes"><div><span>Dirección de despacho</span><strong>{quote.deliveryAddress || client?.address || 'Pendiente'}</strong></div><div><span>Observaciones</span><strong>{quote.notes || 'Sin observaciones'}</strong></div></div>
      <div className="quoteDetailTotal"><span>Total cotización</span><strong>{money(quoteTotal(quote.lines, quote.exchangeRate))}</strong></div>
      <div className="quoteActions"><button className="secondary" onClick={() => window.alert('Funcionalidad pendiente de integración')}>Enviar cotización</button><button className="secondary" onClick={() => window.alert('Funcionalidad pendiente de integración')}>Generar PDF</button><button className="secondary" onClick={() => window.alert('Funcionalidad pendiente de integración')}>Ingresar a SAP</button></div>
    </section>
  </>;
}
