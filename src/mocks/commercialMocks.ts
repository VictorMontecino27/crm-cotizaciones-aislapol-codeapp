import type { Activity, AgreedPrice, Client, CommercialQuote, Freight, Opportunity, Product, SapOrder } from '../types/commercial';

export const mockClients: Client[] = [
  { id: 'C-1001', sapId: '100001', name: 'Cliente Demo Norte SpA', rut: '76.111.111-1', segment: 'Construcción', contact: 'Ana Torres', email: 'ana@demo-norte.cl', phone: '+56 9 1111 1001', address: 'Camino Industrial 101', region: 'Antofagasta', city: 'Antofagasta', payment: 'C30', notes: 'Cuenta demostrativa para aislamiento térmico.', contacts: [
    { id: 'CON-1001-1', name: 'Ana Torres', email: 'ana@demo-norte.cl', phone: '+56 9 1111 1001', role: 'Compras', active: true },
    { id: 'CON-1001-2', name: 'Diego Rojas', email: 'diego@demo-norte.cl', phone: '+56 9 1111 1002', role: 'Jefatura de obra', active: true },
  ], addresses: [
    { id: 'DIR-1001-1', name: 'Casa matriz', address: 'Camino Industrial 101', commune: 'Antofagasta', region: 'Antofagasta', active: true, default: true },
    { id: 'DIR-1001-2', name: 'Bodega norte', address: 'Ruta 5 norte km 1180', commune: 'Antofagasta', region: 'Antofagasta', active: true, default: false },
  ], recipients: [
    { id: 'DST-1001-1', shipToParty: '100001', name: 'Obra Demo Norte', address: 'Ruta 5 norte km 1180', commune: 'Antofagasta', active: true, plant: 'PTS1' },
  ], sap: { soldToParty: '100001', financialStatus: 'AL_DIA' } },
  { id: 'C-1002', sapId: '100002', name: 'Industria Demo Centro Ltda.', rut: '76.222.222-K', segment: 'Industrial', contact: 'Bruno Silva', email: 'bruno@demo-centro.cl', phone: '+56 9 2222 1002', address: 'Av. de los Talleres 250', region: "O'Higgins", city: 'Rancagua', payment: 'C60', notes: 'Solicita seguimiento técnico trimestral.', contacts: [
    { id: 'CON-1002-1', name: 'Bruno Silva', email: 'bruno@demo-centro.cl', phone: '+56 9 2222 1002', role: 'Adquisiciones', active: true },
    { id: 'CON-1002-2', name: 'Paula Herrera', email: 'paula@demo-centro.cl', phone: '+56 9 2222 1003', role: 'Mantención', active: true },
  ], addresses: [
    { id: 'DIR-1002-1', name: 'Planta central', address: 'Av. de los Talleres 250', commune: 'Rancagua', region: "O'Higgins", active: true, default: true },
  ], recipients: [
    { id: 'DST-1002-1', shipToParty: '100002', name: 'Industria Demo Central', address: 'Av. de los Talleres 250', commune: 'Rancagua', active: true, plant: 'PTS2' },
  ], sap: { soldToParty: '100002', financialStatus: 'AL_DIA' } },
  { id: 'C-1003', sapId: '100003', name: 'Distribuciones Demo Sur S.A.', rut: '76.333.333-3', segment: 'Distribución', contact: 'Carla Muñoz', email: 'carla@demo-sur.cl', phone: '+56 9 3333 1003', address: 'Ruta Regional 800', region: 'Araucanía', city: 'Temuco', payment: 'CONTADO', notes: 'Cliente demo de zonas distribuidas.', contacts: [
    { id: 'CON-1003-1', name: 'Carla Muñoz', email: 'carla@demo-sur.cl', phone: '+56 9 3333 1003', role: 'Gerencia comercial', active: true },
  ], addresses: [
    { id: 'DIR-1003-1', name: 'Centro de distribución', address: 'Ruta Regional 800', commune: 'Temuco', region: 'Araucanía', active: true, default: true },
  ], recipients: [
    { id: 'DST-1003-1', shipToParty: '100003', name: 'Distribución Demo Sur', address: 'Ruta Regional 800', commune: 'Temuco', active: true, plant: 'PTS3' },
  ], sap: { soldToParty: '100003', financialStatus: 'AL_DIA' } },
];

export const mockOpportunities: Opportunity[] = [
  { id: 'OP-001', clientId: 'C-1001', name: 'Aislación proyecto norte', stage: 'Cotización', amount: 1485000, probability: 60, closeDate: '2026-12-15', nextAction: 'Enviar cotización revisada' },
  { id: 'OP-002', clientId: 'C-1002', name: 'Renovación línea industrial', stage: 'Negociación', amount: 2320000, probability: 75, closeDate: '2026-12-08', nextAction: 'Reunión de cierre' },
  { id: 'OP-003', clientId: 'C-1003', name: 'Pack distribución sur', stage: 'Calificada', amount: 875000, probability: 35, closeDate: '2027-01-20', nextAction: 'Agendar visita técnica' },
];

export const mockActivities: Activity[] = [
  { id: 'ACT-001', clientId: 'C-1001', opportunityId: 'OP-001', type: 'Visita', subject: 'Revisión de requisitos en obra', date: '2026-11-07', nextAction: 'Enviar propuesta técnica', result: 'Pendiente confirmación del cliente', status: 'Pendiente', overdue: true },
  { id: 'ACT-002', clientId: 'C-1002', opportunityId: 'OP-002', type: 'Reunión', subject: 'Negociación comercial', date: '2026-11-09', nextAction: 'Acordar condiciones', result: '', status: 'Pendiente' },
  { id: 'ACT-003', clientId: 'C-1003', opportunityId: 'OP-003', type: 'Llamada', subject: 'Seguimiento inicial', date: '2026-11-11', nextAction: 'Preparar visita', result: 'Cliente solicitó dimensiones disponibles', status: 'Completada' },
];

export const mockProducts: Product[] = [
  { id: 'PRD-001', description: 'Panel aislante demo estándar', group: 'Paneles', plant: 'Planta Norte', unit: 'PZA', weight: 12.4, volume: 0.08, stock: 320, cost: 68500 },
  { id: 'PRD-002', description: 'Lana aislante demo 50 mm', group: 'Lanas', plant: 'Planta Central', unit: 'M2', weight: 1.8, volume: 0.05, stock: 1250, cost: 4200 },
  { id: 'PRD-003', description: 'Kit sellador demo industrial', group: 'Selladores', plant: 'Planta Sur', unit: 'CJ', weight: 4.2, volume: 0.025, stock: 84, cost: 18200 },
];

export const mockFreights: Freight[] = [
  { id: 'FT-001', destination: 'Antofagasta', region: 'Antofagasta', plant: 'Planta Norte', provider: 'Transporte Demo Norte', equipment: 'Camión rígido', capacity: 12, rate: 485000 },
  { id: 'FT-002', destination: 'Rancagua', region: 'O’Higgins', plant: 'Planta Central', provider: 'Logística Demo Central', equipment: 'Camión con baranda', capacity: 18, rate: 215000 },
  { id: 'FT-003', destination: 'Temuco', region: 'Araucanía', plant: 'Planta Sur', provider: 'Carga Demo Sur', equipment: 'Camión de plataforma', capacity: 22, rate: 348000 },
];

export const mockAgreedPrices: AgreedPrice[] = [
  { id: 'PA-001', clientId: 'C-1001', productId: 'PRD-001', plant: 'Planta Norte', price: 94500, validFrom: '2026-10-01', validTo: '2026-12-31', status: 'Vigente' },
  { id: 'PA-002', clientId: 'C-1002', productId: 'PRD-002', plant: 'Planta Central', price: 6100, validFrom: '2026-09-01', validTo: '2026-11-30', status: 'Por vencer' },
  { id: 'PA-003', clientId: 'C-1003', productId: 'PRD-003', plant: 'Planta Sur', price: 25800, validFrom: '2026-11-01', validTo: '2027-02-28', status: 'Pendiente aprobación' },
];

export const mockCommercialQuotes: CommercialQuote[] = [
  { id: 'CT-0001', version: 1, clientId: 'C-1001', recipient: 'Obra Demo Norte', contact: 'Ana Torres', status: 'Revisar', currency: 'CLP', exchangeRate: 1, payment: 'C30', delivery: '2026-11-12', validity: '2026-11-27', notes: 'Cotización demostrativa.', createdAt: '2026-11-04', lines: [{ productId: 'PRD-001', quantity: 12, saleUnit: 'PZA', price: 94500, margin: 15, freight: 485000 }] },
  { id: 'CT-0002', version: 2, clientId: 'C-1002', recipient: 'Industria Demo Central', contact: 'Bruno Silva', status: 'Enviada', currency: 'CLP', exchangeRate: 1, payment: 'C60', delivery: '2026-11-14', validity: '2026-11-29', notes: 'Entregar según coordinación.', createdAt: '2026-11-03', lines: [{ productId: 'PRD-002', quantity: 100, saleUnit: 'M2', price: 6100, margin: 18, freight: 215000 }] },
  { id: 'CT-0003', version: 1, clientId: 'C-1003', recipient: 'Distribución Demo Sur', contact: 'Carla Muñoz', status: 'Ingresado SAP', currency: 'CLP', exchangeRate: 1, payment: 'CONTADO', delivery: '2026-11-18', validity: '2026-12-03', notes: 'Pedido de prueba.', createdAt: '2026-11-02', lines: [{ productId: 'PRD-003', quantity: 20, saleUnit: 'CJ', price: 25800, margin: 14, freight: 348000 }] },
];

export const mockSapOrders: SapOrder[] = [
  { id: 'SAP-900001', quoteId: 'CT-0003', clientId: 'C-1003', status: 'Preparación', deliveryDate: '2026-11-18', total: 864000 },
  { id: 'SAP-900002', quoteId: 'CT-0002', clientId: 'C-1002', status: 'Despachado', deliveryDate: '2026-11-14', total: 825000 },
];
