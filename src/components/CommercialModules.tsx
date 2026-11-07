import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { QuotesWorkspace as QuotesFeature } from '../features/quotes/QuotesWorkspace';
import { commercialRepository } from '../services/commercialRepository';
import { cubicMeters, quoteTotal } from '../utils/commercialCalculations';
import type { Activity, AgreedPrice, Client, CommercialQuote, Freight, Opportunity, Product, SapOrder } from '../types/commercial';

const money = (value: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
function Intro({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return <section className="moduleIntro"><div><span className="moduleEyebrow">Comercial</span><h1>{title}</h1><p>{subtitle}</p></div>{action}</section>;
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div className="moduleFilters"><label><span>Buscar</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label></div>;
}

export function FieldCommercial() {
  const [tab, setTab] = useState<'visitas' | 'ruta'>('visitas');
  const [activities, setActivities] = useState<Activity[]>([]);
  useEffect(() => { void commercialRepository.activities().then(setActivities); }, []);
  const visits = activities.filter(activity => activity.type === 'Visita');
  return <><Intro title="Campo comercial" subtitle="Gestiona visitas, ruta y próximos compromisos del equipo comercial." /><section className="card moduleCard"><div className="tabBar"><button className={tab === 'visitas' ? 'active' : ''} onClick={() => setTab('visitas')}>Visitas programadas</button><button className={tab === 'ruta' ? 'active' : ''} onClick={() => setTab('ruta')}>Ruta diaria</button></div>{tab === 'visitas' ? <div className="fieldVisitGrid">{visits.length ? visits.map(activity => <article key={activity.id}><span>{activity.date}</span><h3>{activity.subject}</h3><p>{activity.nextAction || 'Próxima acción por definir'} · {activity.status}</p><button className="secondary">Abrir ficha</button></article>) : <p className="muted">No hay visitas programadas.</p>}</div> : <div className="routeTimeline"><div><b>09:30</b><span>Cliente Demo Norte · Camino Industrial 101</span></div><div><b>12:00</b><span>Industria Demo Centro · Av. de los Talleres 250</span></div><div><b>15:30</b><span>Distribuciones Demo Sur · Ruta Regional 800</span></div></div>}</section></>;
}

export function SalesWorkspace({ onNavigate }: { onNavigate: (module: string) => void }) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [quotes, setQuotes] = useState<CommercialQuote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  useEffect(() => { void resolveCommercialData().then(data => { setOpportunities(data.opportunities); setActivities(data.activities); setQuotes(data.quotes); setClients(data.clients); }); }, []);
  const openStages = new Set(['Nueva', 'Calificada', 'Cotización', 'Negociación']);
  const open = opportunities.filter(item => openStages.has(item.stage));
  const weighted = open.reduce((sum, item) => sum + item.amount * item.probability / 100, 0);
  const withoutNext = open.filter(item => !item.nextAction);
  const overdue = activities.filter(item => item.status === 'Pendiente' && item.overdue);
  const stages = ['Nuevo', 'Contactado', 'Calificado', 'Cotizando', 'Negociación', 'Ganado'];
  const stageAliases: Record<string, string[]> = { Nuevo: ['Nueva'], Contactado: [], Calificado: ['Calificada'], Cotizando: ['Cotización'], Negociación: ['Negociación'], Ganado: ['Ganada'] };
  const priorities = [...overdue.map(item => ({ kind: 'Actividad vencida', title: item.subject, detail: `${clients.find(client => client.id === item.clientId)?.name || 'Cliente'} · vencida`, target: 'actividades' })), ...withoutNext.map(item => ({ kind: 'Seguimiento pendiente', title: item.name, detail: `${clients.find(client => client.id === item.clientId)?.name || 'Cliente'} · sin próxima acción`, target: 'oportunidades' }))].slice(0, 8);
  return <><Intro title="Centro de ventas" subtitle="Gestiona el pipeline, prioriza oportunidades y mantiene el control de los compromisos comerciales." action={<div className="salesWorkspaceActions"><button className="secondary" onClick={() => onNavigate('actividades')}>Nueva actividad</button><button className="primary" onClick={() => onNavigate('cotizaciones')}>Nueva cotización</button></div>} /><section className="salesMetrics"><article><span>Pipeline abierto</span><strong>{money(open.reduce((sum, item) => sum + item.amount, 0))}</strong><small>{open.length} oportunidades activas</small></article><article><span>Previsión ponderada</span><strong>{money(weighted)}</strong><small>Proyección según probabilidad</small></article><article className={withoutNext.length + overdue.length ? 'needsAction' : ''}><span>Alertas comerciales</span><strong>{withoutNext.length + overdue.length}</strong><small>{overdue.length} pendientes · {withoutNext.length} sin seguimiento</small></article><article><span>Cotizaciones enviadas</span><strong>{quotes.filter(item => item.status === 'Enviada').length}</strong><small>Propuestas en seguimiento</small></article></section><section className="salesWorkspaceGrid"><article className="card priorityConsole"><div className="cardHead"><div><p className="kicker">PRIORIDADES</p><h2>Prioridades comerciales</h2></div><span className="priorityCount">{priorities.length}</span></div>{priorities.length ? <div className="priorityList">{priorities.map((item, index) => <button key={`${item.title}-${index}`} className="priorityItem attention" onClick={() => onNavigate(item.target)}><span>{item.kind}</span><strong>{item.title}</strong><small>{item.detail}</small><b>Ver →</b></button>)}</div> : <div className="salesEmpty"><strong>Sin alertas críticas</strong><span>No hay compromisos pendientes de atención inmediata.</span></div>}</article><article className="card forecastCard"><div className="cardHead"><div><p className="kicker">PREVISIÓN DE VENTAS</p><h2>Cobertura de oportunidades</h2></div></div>{stages.map(stage => { const items = opportunities.filter(item => stageAliases[stage].includes(item.stage)); const amount = items.reduce((sum, item) => sum + item.amount, 0); const forecast = items.reduce((sum, item) => sum + item.amount * item.probability / 100, 0); return <div className="forecastRow" key={stage}><div><strong>{stage}</strong><small>{items.length} oportunidades</small></div><span>{money(amount)}</span><em>{money(forecast)} previsto</em></div>; })}<button className="textButton forecastLink" onClick={() => onNavigate('oportunidades')}>Abrir pipeline completo →</button></article></section><section className="dealHealth"><div><p className="kicker">SALUD DEL NEGOCIO</p><h2>Gestión de oportunidades</h2><div className="healthRules"><span><b>1</b> Próxima acción definida</span><span><b>2</b> Fecha de cierre vigente</span><span><b>3</b> Cotización dentro de vigencia</span></div></div></section></>;
}

export async function resolveCommercialData() {
  const [clients, opportunities, activities, quotes, products, freights, agreedPrices, sapOrders] = await Promise.all([
    commercialRepository.clients(), commercialRepository.opportunities(), commercialRepository.activities(), commercialRepository.quotes(),
    commercialRepository.products(), commercialRepository.freights(), commercialRepository.agreedPrices(), commercialRepository.sapOrders(),
  ]);
  return { clients, opportunities, activities, quotes, products, freights, agreedPrices, sapOrders };
}

export function ClientsWorkspace({ onNavigate }: { onNavigate?: (module: string) => void }) {
  const [search, setSearch] = useState('');
  const [commune, setCommune] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [tab, setTab] = useState<'resumen' | 'oportunidades' | 'cotizaciones' | 'actividad' | 'perfil' | 'contactos' | 'direcciones' | 'destinatarios'>('resumen');
  const [clients, setClients] = useState<Client[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [quotes, setQuotes] = useState<CommercialQuote[]>([]);
  const [agreements, setAgreements] = useState<AgreedPrice[]>([]);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Partial<Client>>({});
  const [message, setMessage] = useState('');
  useState(() => { void resolveCommercialData().then(setData => { setClients(setData.clients); setOpportunities(setData.opportunities); setActivities(setData.activities); setQuotes(setData.quotes); setAgreements(setData.agreedPrices); }); });
  const communes = [...new Set(clients.map(client => client.city).filter(Boolean))].sort();
  const filteredClients = clients.filter(item => (!commune || item.city === commune));
  const visible = filteredClients.filter(client => `${client.id} ${client.sapId} ${client.name} ${client.rut} ${client.city}`.toLowerCase().includes(search.toLowerCase()));
  const client = clients.find(item => item.id === selectedId);
  const clientQuotes = quotes.filter(item => item.clientId === selectedId);
  const clientOpportunities = opportunities.filter(item => item.clientId === selectedId);
  const clientActivities = activities.filter(item => item.clientId === selectedId);
  const clientAgreements = agreements.filter(item => item.clientId === selectedId);
  const openStages = new Set(['Nueva', 'Calificada', 'Cotización', 'Negociación']);
  const openOpportunities = clientOpportunities.filter(item => openStages.has(item.stage));
  const pending = clientActivities.filter(item => item.status === 'Pendiente');
  const nextActivity = [...pending].sort((a, b) => a.date.localeCompare(b.date))[0];
  const pipeline = openOpportunities.reduce((sum, item) => sum + item.amount, 0);
  const weighted = openOpportunities.reduce((sum, item) => sum + item.amount * item.probability / 100, 0);
  const quoted = clientQuotes.reduce((sum, item) => sum + quoteTotal(item.lines), 0);
  const latestQuote = [...clientQuotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const today = new Date().toISOString().slice(0, 10);
  const overdue = pending.filter(item => item.date < today);
  const timeline = [
    ...clientQuotes.map(item => ({ kind: 'Cotización', date: item.createdAt, title: item.id, detail: `${money(quoteTotal(item.lines))} · ${item.status}`, quoteId: item.id })),
    ...clientOpportunities.map(item => ({ kind: 'Oportunidad', date: item.closeDate, title: item.name, detail: `${item.stage} · ${money(item.amount)} · ${item.probability}%`, quoteId: '' })),
    ...clientActivities.map(item => ({ kind: item.type, date: item.date, title: item.subject, detail: `${item.status}${item.nextAction ? ` · Próxima: ${item.nextAction}` : ''}`, quoteId: '' })),
  ].filter(item => item.date).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
  const selectClient = (id: string) => { setSelectedId(id); setTab('resumen'); setEditing(false); setMessage(''); };
  const saveClient = async () => {
    if (!client) return;
    const email = String(values.email ?? client.email ?? '').trim();
    const phone = String(values.phone ?? client.phone ?? '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMessage('Corrige correo o teléfono antes de guardar.'); return; }
    if (phone && !/^(\+?56\s?9\d{8}|9\d{8})$/.test(phone.replace(/\s/g, ''))) { setMessage('Corrige correo o teléfono antes de guardar.'); return; }
    try {
      const saved = await commercialRepository.updateClient(client.id, values);
      setClients(items => items.map(item => item.id === saved.id ? saved : item));
      setEditing(false);
      setMessage('Datos comerciales actualizados.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No fue posible guardar los datos comerciales.');
    }
  };
  const startEditing = () => { if (!client) return; setValues({ ...client }); setEditing(true); setMessage(''); };
  return <><Intro title="Maestro de clientes" subtitle="Consolida la relación comercial, oportunidades, cotizaciones y compromisos en una sola ficha." action={client ? <div className="clientMasterActions"><button className="secondary" onClick={() => onNavigate?.('actividades')}>Registrar actividad</button><button className="secondary" onClick={() => onNavigate?.('oportunidades')}>Nueva oportunidad</button><button className="primary" onClick={() => onNavigate?.('cotizaciones')}>Nueva cotización</button></div> : undefined} /><section className="card clientMaster"><div className="formGrid clientLocationFilters"><label>Filtrar por comuna<select value={commune} onChange={event => { setCommune(event.target.value); setSelectedId(''); setEditing(false); }}><option value="">Todas las comunas</option>{communes.map(item => <option key={item}>{item}</option>)}</select></label></div><SearchBox value={search} onChange={setSearch} placeholder="Buscar cliente por nombre, código SAP, RUT o comuna" /><label className="clientPicker"><span>Cuenta seleccionada</span><select value={selectedId} onChange={event => selectClient(event.target.value)}><option value="">Seleccionar cliente</option>{visible.map(item => <option key={item.id} value={item.id}>{item.name} · {item.rut}</option>)}</select></label>{!visible.length && <p className="muted">No hay clientes para esos filtros.</p>} {!client ? <div className="clientEmpty"><strong>Selecciona una cuenta</strong><span>Revisa su contexto comercial y registra la siguiente acción.</span></div> : <>
      <section className="clientHero clientMasterHero"><div><p className="kicker">CUENTA COMERCIAL</p><h2>{client.name}</h2><p>{client.rut || 'RUT pendiente'} · {client.segment || 'Segmento pendiente'} · {client.region || 'Región pendiente'} · {client.city || 'Comuna pendiente'}</p></div><div className="clientHeroMeta"><span>{openOpportunities.length} oportunidades abiertas</span><span>{pending.length} compromisos pendientes</span></div></section>
      <section className="clientMasterMetrics"><div><span>Pipeline abierto</span><strong>{money(pipeline)}</strong><small>{openOpportunities.length} oportunidades · {money(weighted)} ponderado</small></div><div><span>Cotizado históricamente</span><strong>{money(quoted)}</strong><small>{clientQuotes.length} cotizaciones registradas</small></div><div className={overdue.length ? 'needsAction' : ''}><span>Próximo compromiso</span><strong>{nextActivity ? nextActivity.date : 'Sin actividad'}</strong><small>{nextActivity?.subject || 'Registra la siguiente acción comercial.'}</small></div><div><span>Última cotización</span><strong>{latestQuote?.id || '—'}</strong><small>{latestQuote ? `${latestQuote.status} · ${money(quoteTotal(latestQuote.lines))}` : 'Aún no hay cotizaciones.'}</small></div></section>
      <nav className="clientTabs">{([
        ['resumen', 'Resumen'], ['oportunidades', `Oportunidades (${clientOpportunities.length})`], ['cotizaciones', `Cotizaciones (${clientQuotes.length})`],
        ['actividad', `Actividad (${clientActivities.length})`], ['perfil', 'Perfil y condiciones'], ['contactos', 'Contactos'], ['direcciones', 'Direcciones'], ['destinatarios', 'Destinatarios'],
      ] as const).map(([id, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</nav>
      {tab === 'resumen' && <div className="clientMasterOverview"><section><p className="kicker">PRIORIDADES DE LA CUENTA</p><h3>Seguimiento requerido</h3>{overdue.length ? <p className="approvalBanner">Hay {overdue.length} actividad{overdue.length === 1 ? '' : 'es'} vencida{overdue.length === 1 ? '' : 's'} que requieren gestión.</p> : <p className="ruleBanner">Sin compromisos vencidos. Mantén registrada una próxima acción para preservar la continuidad comercial.</p>}{openOpportunities.some(item => !item.nextAction) && <p className="approvalBanner">{openOpportunities.filter(item => !item.nextAction).length} oportunidades abiertas sin próxima acción definida.</p>}</section><section className="clientTimeline"><p className="kicker">TRAZABILIDAD COMERCIAL</p><h3>Actividad reciente</h3>{timeline.length ? timeline.map((item, index) => <button className="clientTimelineItem" key={`${item.kind}-${item.date}-${index}`}><span>{item.date}</span><div><small>{item.kind}</small><strong>{item.title}</strong><em>{item.detail}</em></div>{item.quoteId && <b>Abrir →</b>}</button>) : <p className="muted">Aún no existe actividad comercial registrada para esta cuenta.</p>}</section></div>}
      {tab === 'oportunidades' && <SimpleTable headers={['Negocio', 'Etapa', 'Monto', 'Probabilidad', 'Cierre estimado', 'Próxima acción']} rows={clientOpportunities.map(item => [item.name, item.stage, money(item.amount), `${item.probability}%`, item.closeDate, item.nextAction || 'Sin definir'])} />}
      {tab === 'cotizaciones' && <SimpleTable headers={['Correlativo', 'Emisión', 'Total', 'Estado', '']} rows={clientQuotes.map(item => [item.id, item.createdAt, money(quoteTotal(item.lines)), item.status, ''])} />}
      {tab === 'actividad' && <SimpleTable headers={['Fecha', 'Tipo', 'Asunto / objetivo', 'Próxima acción', 'Estado']} rows={clientActivities.map(item => [item.date, item.type, item.subject || '—', item.nextAction || '—', item.status])} />}
      {tab === 'perfil' && <><div className="clientDetails"><div><span>Contacto principal</span><strong>{client.contact || 'Pendiente'}</strong></div><div><span>Correo</span><strong>{client.email || 'Pendiente'}</strong></div><div><span>Teléfono</span><strong>{client.phone || 'Pendiente'}</strong></div><div><span>Región</span><strong>{client.region || 'Pendiente'}</strong></div><div><span>Comuna</span><strong>{client.city || 'Pendiente'}</strong></div><div><span>Dirección</span><strong>{client.address || 'Pendiente'}</strong></div><div><span>Condición de pago</span><strong>{client.payment || 'Pendiente'}</strong></div><div><span>Precios acordados aprobados</span><strong>{clientAgreements.filter(item => item.status === 'Vigente').length}</strong></div></div>{!editing ? <div className="clientEditAction"><button className="secondary" onClick={startEditing}>Editar datos comerciales</button>{message && <p className="formError">{message}</p>}</div> : <section className="clientEditPanel"><div className="sectionHead"><div><p className="kicker">EDICIÓN DE FICHA</p><h3>Datos comerciales</h3></div><button className="textButton" onClick={() => setEditing(false)}>Cancelar</button></div><div className="formGrid"><label>Contacto<input value={String(values.contact ?? '')} onChange={event => setValues(current => ({ ...current, contact: event.target.value }))} /></label><label>Correo<input type="email" value={String(values.email ?? '')} onChange={event => setValues(current => ({ ...current, email: event.target.value }))} /></label><label>Teléfono<input value={String(values.phone ?? '')} onChange={event => setValues(current => ({ ...current, phone: event.target.value }))} /></label><label>Región<input value={String(values.region ?? '')} onChange={event => setValues(current => ({ ...current, region: event.target.value }))} /></label><label>Comuna<input value={String(values.city ?? '')} onChange={event => setValues(current => ({ ...current, city: event.target.value }))} /></label><label>Dirección<input value={String(values.address ?? '')} onChange={event => setValues(current => ({ ...current, address: event.target.value }))} /></label><label>Segmento<select value={String(values.segment ?? '')} onChange={event => setValues(current => ({ ...current, segment: event.target.value }))}><option value="">Seleccionar</option>{[...new Set(clients.map(item => item.segment).filter(Boolean))].map(segment => <option key={segment}>{segment}</option>)}</select></label><label>Condición de pago<input disabled value={client.payment || 'Pendiente'} /><small>Para cambiarla, solicita una actualización autorizada del maestro del cliente.</small></label></div><label>Observaciones<textarea value={String(values.notes ?? '')} onChange={event => setValues(current => ({ ...current, notes: event.target.value }))} /></label><button className="primary" onClick={saveClient}>Guardar datos comerciales</button>{message && <p className="formError">{message}</p>}</section>}</>}
      {tab === 'contactos' && (client.contacts.length ? <SimpleTable headers={['Contacto', 'Cargo', 'Correo', 'Teléfono', 'Estado']} rows={client.contacts.map(item => [item.name, item.role, item.email, item.phone, item.active ? 'Activo' : 'Inactivo'])} /> : <p className="muted">No hay contactos registrados para este cliente.</p>)}
      {tab === 'direcciones' && (client.addresses.length ? <SimpleTable headers={['Nombre', 'Dirección', 'Comuna', 'Región', 'Estado']} rows={client.addresses.map(item => [item.name, item.address, item.commune, item.region, item.default ? 'Principal' : item.active ? 'Activa' : 'Inactiva'])} /> : <p className="muted">No hay direcciones registradas para este cliente.</p>)}
      {tab === 'destinatarios' && (client.recipients.length ? <SimpleTable headers={['Código', 'Destinatario', 'Dirección', 'Comuna', 'Planta', 'Estado']} rows={client.recipients.map(item => [item.shipToParty, item.name, item.address, item.commune, item.plant, item.active ? 'Activo' : 'Inactivo'])} /> : <p className="muted">No hay destinatarios SAP asociados a este cliente.</p>)}
    </>}</section></>;
}

export function OpportunitiesWorkspace() {
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('Todas');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  useState(() => { void resolveCommercialData().then(data => { setOpportunities(data.opportunities); setClients(data.clients); }); });
  const visible = opportunities.filter(item => (stage === 'Todas' || item.stage === stage) && `${item.name} ${item.id}`.toLowerCase().includes(search.toLowerCase()));
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ clientId: 'C-1001', name: '', stage: 'Nueva', amount: '', probability: '50', closeDate: '', nextAction: '' });
  const createOpportunity = async () => {
    if (!draft.name.trim() || !draft.closeDate) return;
    await commercialRepository.createOpportunity({ id: `OP-${String(opportunities.length + 1).padStart(3, '0')}`, clientId: draft.clientId, name: draft.name.trim(), stage: draft.stage as Opportunity['stage'], amount: Number(draft.amount || 0), probability: Number(draft.probability), closeDate: draft.closeDate, nextAction: draft.nextAction.trim() });
    setOpportunities(await commercialRepository.opportunities()); setCreating(false);
    setDraft({ clientId: 'C-1001', name: '', stage: 'Nueva', amount: '', probability: '50', closeDate: '', nextAction: '' });
  };
  return <><Intro title="Oportunidades" subtitle="Sigue el pipeline comercial, el importe esperado y las próximas acciones." action={<button className="primary" onClick={() => setCreating(true)}>＋ Nueva oportunidad</button>} /><section className="card moduleCard"><div className="moduleFilters"><SearchBox value={search} onChange={setSearch} placeholder="Oportunidad o correlativo" /><label><span>Etapa</span><select value={stage} onChange={e => setStage(e.target.value)}>{['Todas', 'Nueva', 'Calificada', 'Cotización', 'Negociación', 'Ganada', 'Perdida'].map(item => <option key={item}>{item}</option>)}</select></label></div>{creating && <section className="opportunityCreate"><div className="formGrid"><label>Cliente<select value={draft.clientId} onChange={e => setDraft({...draft, clientId: e.target.value})}>{clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label><label>Negocio<input value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} /></label><label>Etapa<select value={draft.stage} onChange={e => setDraft({...draft, stage: e.target.value})}>{['Nueva', 'Calificada', 'Cotización', 'Negociación', 'Ganada', 'Perdida'].map(item => <option key={item}>{item}</option>)}</select></label><label>Monto<input type="number" min="0" value={draft.amount} onChange={e => setDraft({...draft, amount: e.target.value})} /></label><label>Probabilidad (%)<input type="number" min="0" max="100" value={draft.probability} onChange={e => setDraft({...draft, probability: e.target.value})} /></label><label>Cierre estimado<input type="date" value={draft.closeDate} onChange={e => setDraft({...draft, closeDate: e.target.value})} /></label><label>Próxima acción<input value={draft.nextAction} onChange={e => setDraft({...draft, nextAction: e.target.value})} /></label></div><div className="actions"><button className="primary" disabled={!draft.name.trim() || !draft.closeDate} onClick={createOpportunity}>Crear oportunidad</button><button className="secondary" onClick={() => setCreating(false)}>Cancelar</button></div></section>}<SimpleTable headers={['Oportunidad', 'Cliente', 'Etapa', 'Monto', 'Probabilidad', 'Cierre', 'Próxima acción']} rows={visible.map(o => [o.name, clients.find(c => c.id === o.clientId)?.name || o.clientId, o.stage, money(o.amount), `${o.probability}%`, o.closeDate, o.nextAction])} /></section></>;
}

export function ActivitiesWorkspace() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todas');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  useState(() => { void resolveCommercialData().then(data => { setActivities(data.activities); setClients(data.clients); }); });
  const visible = activities.filter(a => (status === 'Todas' || a.status === status) && `${a.subject} ${a.type}`.toLowerCase().includes(search.toLowerCase()));
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ clientId: 'C-1001', type: 'Visita', subject: '', date: '', nextAction: '' });
  const createActivity = async () => {
    if (!draft.subject.trim() || !draft.date) return;
    await commercialRepository.createActivity({ id: `ACT-${String(activities.length + 1).padStart(3, '0')}`, clientId: draft.clientId, type: draft.type as Activity['type'], subject: draft.subject.trim(), date: draft.date, nextAction: draft.nextAction.trim(), result: '', status: 'Pendiente' });
    setActivities(await commercialRepository.activities()); setCreating(false);
    setDraft({ clientId: 'C-1001', type: 'Visita', subject: '', date: '', nextAction: '' });
  };
  return <><Intro title="Actividades y visitas" subtitle="Planifica y completa llamadas, reuniones, visitas y seguimientos." action={<button className="primary" onClick={() => setCreating(true)}>＋ Nueva actividad</button>} /><section className="card moduleCard"><div className="moduleFilters"><SearchBox value={search} onChange={setSearch} placeholder="Tipo o asunto" /><label><span>Estado</span><select value={status} onChange={e => setStatus(e.target.value)}>{['Todas', 'Pendiente', 'Completada', 'Cancelada'].map(item => <option key={item}>{item}</option>)}</select></label></div>{creating && <section className="opportunityCreate"><div className="formGrid"><label>Cliente<select value={draft.clientId} onChange={e => setDraft({...draft, clientId: e.target.value})}>{clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label><label>Tipo<select value={draft.type} onChange={e => setDraft({...draft, type: e.target.value})}>{['Visita', 'Llamada', 'Reunión', 'Seguimiento'].map(item => <option key={item}>{item}</option>)}</select></label><label>Fecha<input type="date" value={draft.date} onChange={e => setDraft({...draft, date: e.target.value})} /></label><label>Asunto<input value={draft.subject} onChange={e => setDraft({...draft, subject: e.target.value})} /></label><label>Próxima acción<input value={draft.nextAction} onChange={e => setDraft({...draft, nextAction: e.target.value})} /></label></div><div className="actions"><button className="primary" disabled={!draft.subject.trim() || !draft.date} onClick={createActivity}>Crear actividad</button><button className="secondary" onClick={() => setCreating(false)}>Cancelar</button></div></section>}<SimpleTable headers={['Fecha', 'Cliente', 'Tipo', 'Asunto', 'Próxima acción', 'Estado']} rows={visible.map(a => [a.date, clients.find(c => c.id === a.clientId)?.name || a.clientId, a.type, a.subject, a.nextAction, a.status])} /></section></>;
}

export function QuotesWorkspace(_: { onNavigate: (module: string) => void }) {
  return <QuotesFeature />;
}

export function LegacyQuotesWorkspace(_: { onNavigate: (module: string) => void }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todas');
  const [quotes, setQuotes] = useState<CommercialQuote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<CommercialQuote | null>(null);
  const [editing, setEditing] = useState(false);
  useState(() => { void resolveCommercialData().then(data => { setQuotes(data.quotes); setClients(data.clients); }); });
  const visible = quotes.filter(q => (status === 'Todas' || q.status === status) && `${q.id} ${clients.find(c => c.id === q.clientId)?.name || ''}`.toLowerCase().includes(search.toLowerCase()));
  if (editing) return <QuoteEditor onCancel={() => setEditing(false)} onSave={quote => { setQuotes(items => [...items, quote]); setEditing(false); }} />;
  if (selected) return <QuoteDetail quote={selected} client={clients.find(c => c.id === selected.clientId)} onBack={() => setSelected(null)} />;
  return <><Intro title="Cotizaciones" subtitle="Busca, revisa y crea propuestas comerciales con cálculo de líneas y vigencia." action={<button className="primary" onClick={() => setEditing(true)}>＋ Nueva cotización</button>} /><section className="card moduleCard"><div className="moduleFilters"><SearchBox value={search} onChange={setSearch} placeholder="Correlativo o cliente" /><label><span>Estado</span><select value={status} onChange={e => setStatus(e.target.value)}>{['Todas', 'Revisar', 'Enviada', 'Ingresado SAP', 'Completada', 'Vencida'].map(item => <option key={item}>{item}</option>)}</select></label></div><SimpleTable headers={['Correlativo', 'Cliente', 'Versión', 'Total', 'Entrega', 'Estado', '']} rows={visible.map(q => [q.id, clients.find(c => c.id === q.clientId)?.name || q.clientId, q.version, money(quoteTotal(q.lines)), q.delivery, q.status, ''])} onRow={q => { const quote = visible.find(item => item.id === String(q[0])); if (quote) setSelected(quote); }} /></section></>;
}

function QuoteEditor({ onCancel, onSave }: { onCancel: () => void; onSave: (quote: CommercialQuote) => void }) {
  const [clientId, setClientId] = useState('C-1001');
  const [recipient, setRecipient] = useState('Obra Demo');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(94500);
  const [freight, setFreight] = useState(485000);
  const [currency, setCurrency] = useState('CLP');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const total = quoteTotal([{ quantity, price, freight }], exchangeRate);
  return <><Intro title="Nueva cotización" subtitle="Configura cliente, líneas, moneda, vigencia y entrega." action={<button className="secondary" onClick={onCancel}>Cancelar</button>} /><section className="card moduleCard quoteEditor"><div className="formGrid"><label>Cliente<select value={clientId} onChange={e => setClientId(e.target.value)}><option value="C-1001">C-1001 · Cliente Demo Norte SpA</option><option value="C-1002">C-1002 · Industria Demo Centro Ltda.</option><option value="C-1003">C-1003 · Distribuciones Demo Sur S.A.</option></select></label><label>Destinatario<input value={recipient} onChange={e => setRecipient(e.target.value)} /></label><label>Moneda<select value={currency} onChange={e => setCurrency(e.target.value)}><option>CLP</option><option>USD</option><option>UF</option></select></label><label>Tipo de cambio<input type="number" min="1" value={exchangeRate} onChange={e => setExchangeRate(Number(e.target.value))} /></label><label>Condición de pago<select><option>C15</option><option>C30</option><option>C60</option><option>CONTADO</option></select></label><label>Fecha de entrega<input type="date" defaultValue="2026-11-20" /></label></div><h3>Línea de producto</h3><div className="formGrid"><label>Producto<select><option>PRD-001 · Panel aislante demo estándar</option><option>PRD-002 · Lana aislante demo 50 mm</option></select></label><label>Cantidad<input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} /></label><label>Precio<input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} /></label><label>Flete<input type="number" value={freight} onChange={e => setFreight(Number(e.target.value))} /></label><label>Largo mm<input type="number" value={length} onChange={e => setLength(e.target.value)} /></label><label>Ancho mm<input type="number" value={width} onChange={e => setWidth(e.target.value)} /></label><label>Alto mm<input type="number" value={height} onChange={e => setHeight(e.target.value)} /></label></div><div className="quoteSummary"><div><span>Cubicación</span><strong>{cubicMeters(Number(length), Number(width), Number(height)).toFixed(3)} m³</strong></div><div><span>Total estimado</span><strong>{money(total)}</strong></div><button className="primary" onClick={() => onSave({ id: `CT-${Date.now().toString().slice(-4)}`, version: 1, clientId, recipient, contact: 'Contacto demo', status: 'Revisar', currency, exchangeRate, payment: 'C30', delivery: '2026-11-20', validity: '2026-12-05', notes: '', createdAt: '2026-11-07', lines: [{ productId: 'PRD-001', quantity, saleUnit: 'PZA', price, margin: 15, freight }] })}>Guardar cotización</button></div></section></>;
}

function QuoteDetail({ quote, client, onBack }: { quote: CommercialQuote; client?: Client; onBack: () => void }) {
  return <><Intro title={quote.id} subtitle={`Detalle comercial · Versión ${quote.version}`} action={<button className="secondary" onClick={onBack}>Volver al listado</button>} /><section className="card moduleCard"><div className="detailGrid"><div><span>Cliente</span><strong>{client?.name || quote.clientId}</strong></div><div><span>Destinatario</span><strong>{quote.recipient}</strong></div><div><span>Contacto</span><strong>{quote.contact}</strong></div><div><span>Condición de pago</span><strong>{quote.payment}</strong></div><div><span>Entrega</span><strong>{quote.delivery}</strong></div><div><span>Validez</span><strong>{quote.validity}</strong></div></div><SimpleTable headers={['Producto', 'Cantidad', 'Unidad', 'Precio', 'Margen', 'Flete']} rows={quote.lines.map(line => [line.productId, line.quantity, line.saleUnit, money(line.price), `${line.margin}%`, money(line.freight)])} /><div className="quoteDetailTotal"><span>Total cotización</span><strong>{money(quoteTotal(quote.lines, quote.exchangeRate))}</strong></div></section></>;
}

export function OrdersWorkspace({ initialTab = '360' }: { initialTab?: '360' | 'sap' }) {
  const [tab, setTab] = useState<'360' | 'sap'>(initialTab);
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<SapOrder[]>([]);
  const [quotes, setQuotes] = useState<CommercialQuote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  useState(() => { void resolveCommercialData().then(data => { setOrders(data.sapOrders); setQuotes(data.quotes); setClients(data.clients); }); });
  const visible = orders.filter(o => `${o.id} ${o.quoteId}`.toLowerCase().includes(search.toLowerCase()));
  return <><Intro title={tab === '360' ? 'Pedido 360' : 'Pedidos SAP'} subtitle={tab === '360' ? 'Seguimiento integral desde la cotización hasta la entrega y facturación.' : 'Consulta pedidos simulados y su estado de integración con SAP.'} /><section className="card moduleCard"><div className="tabBar"><button className={tab === '360' ? 'active' : ''} onClick={() => setTab('360')}>Pedido 360</button><button className={tab === 'sap' ? 'active' : ''} onClick={() => setTab('sap')}>Pedidos SAP</button></div><SearchBox value={search} onChange={setSearch} placeholder="Pedido o cotización" /><SimpleTable headers={['Pedido SAP', 'Cotización', 'Cliente', 'Estado', 'Entrega', 'Total']} rows={visible.map(o => [o.id, o.quoteId, clients.find(c => c.id === o.clientId)?.name || o.clientId, o.status, o.deliveryDate, money(o.total)])} />{tab === '360' && <div className="orderTimeline"><div><b>01</b><span>Cotización</span><strong>{quotes.length} documentos</strong></div><div><b>02</b><span>Pedido SAP</span><strong>{orders.length} confirmados</strong></div><div><b>03</b><span>Despacho</span><strong>Seguimiento logístico</strong></div><div><b>04</b><span>Facturación</span><strong>Pendiente</strong></div></div>}</section></>;
}

export function PriceAgreementsWorkspace() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todas');
  const [agreements, setAgreements] = useState<AgreedPrice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  useState(() => { void resolveCommercialData().then(data => { setAgreements(data.agreedPrices); setClients(data.clients); }); });
  const visible = agreements.filter(a => (status === 'Todas' || a.status === status) && `${a.id} ${a.productId} ${a.clientId}`.toLowerCase().includes(search.toLowerCase()));
  return <><Intro title="Precios acordados" subtitle="Consulta vigencias, plantas y estados de aprobación simulados." /><section className="card moduleCard"><div className="moduleFilters"><SearchBox value={search} onChange={setSearch} placeholder="Código, producto o cliente" /><label><span>Estado</span><select value={status} onChange={e => setStatus(e.target.value)}>{['Todas', 'Vigente', 'Por vencer', 'Vencido', 'Pendiente aprobación'].map(item => <option key={item}>{item}</option>)}</select></label></div><SimpleTable headers={['Precio', 'Cliente', 'Producto', 'Planta', 'Precio acordado', 'Vigencia', 'Estado']} rows={visible.map(a => [a.id, clients.find(c => c.id === a.clientId)?.name || a.clientId, a.productId, a.plant, money(a.price), `${a.validFrom} · ${a.validTo}`, a.status])} /></section></>;
}

export function ProductsWorkspace() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  useState(() => { void commercialRepository.products().then(setProducts); });
  const visible = products.filter(p => `${p.id} ${p.description} ${p.group} ${p.plant}`.toLowerCase().includes(search.toLowerCase()));
  return <><Intro title="Productos y costos" subtitle="Catálogo comercial simulado con unidad, planta, stock y costos de referencia." /><section className="card moduleCard"><SearchBox value={search} onChange={setSearch} placeholder="Código, descripción, grupo o planta" /><SimpleTable headers={['Código', 'Descripción', 'Grupo', 'Planta', 'Unidad', 'Peso kg', 'Volumen m³', 'Stock', 'Costo']} rows={visible.map(p => [p.id, p.description, p.group, p.plant, p.unit, p.weight, p.volume, p.stock, money(p.cost)])} /></section></>;
}

export function FreightsWorkspace() {
  const [search, setSearch] = useState('');
  const [freights, setFreights] = useState<Freight[]>([]);
  useState(() => { void commercialRepository.freights().then(setFreights); });
  const visible = freights.filter(f => `${f.destination} ${f.region} ${f.plant} ${f.provider} ${f.equipment}`.toLowerCase().includes(search.toLowerCase()));
  return <><Intro title="Tarifas de flete" subtitle="Consulta destinos, plantas, equipos, capacidades y tarifas simuladas." /><section className="card moduleCard"><SearchBox value={search} onChange={setSearch} placeholder="Destino, región, planta o proveedor" /><SimpleTable headers={['Destino', 'Región', 'Planta', 'Proveedor', 'Equipo', 'Capacidad t', 'Tarifa']} rows={visible.map(f => [f.destination, f.region, f.plant, f.provider, f.equipment, f.capacity, money(f.rate)])} /></section></>;
}

function SimpleTable({ headers, rows, onRow }: { headers: string[]; rows: (string | number)[][]; onRow?: (row: (string | number)[]) => void }) {
  return <div className="tableScroll"><table><thead><tr>{headers.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={index} className={onRow ? 'clickableRow' : ''} onClick={() => onRow?.(row)}>{row.map((cell, cellIndex) => cellIndex === row.length - 1 && headers[cellIndex] === '' && onRow ? <td key={cellIndex}><button className="textButton">Abrir</button></td> : <td key={cellIndex}>{cell}</td>)}</tr>) : <tr><td colSpan={headers.length}>No hay registros para los filtros seleccionados.</td></tr>}</tbody></table></div>;
}
