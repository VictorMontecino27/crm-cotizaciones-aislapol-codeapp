export interface Client {
  id: string;
  sapId: string;
  name: string;
  rut: string;
  segment: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  city: string;
  payment: string;
  notes: string;
  contacts: ClientContact[];
  addresses: ClientAddress[];
  recipients: ClientRecipient[];
  sap: {
    soldToParty: string;
    financialStatus: 'AL_DIA' | 'BLOQUEADO';
  };
}

export interface ClientContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
}

export interface ClientAddress {
  id: string;
  name: string;
  address: string;
  commune: string;
  region: string;
  active: boolean;
  default: boolean;
}

export interface ClientRecipient {
  id: string;
  shipToParty: string;
  name: string;
  address: string;
  commune: string;
  active: boolean;
  plant: string;
}

export interface Opportunity {
  id: string;
  clientId: string;
  name: string;
  stage: 'Nueva' | 'Calificada' | 'Cotización' | 'Negociación' | 'Ganada' | 'Perdida';
  amount: number;
  probability: number;
  closeDate: string;
  nextAction: string;
}

export interface Activity {
  id: string;
  clientId: string;
  opportunityId?: string;
  type: 'Visita' | 'Llamada' | 'Reunión' | 'Seguimiento';
  subject: string;
  date: string;
  nextAction: string;
  result: string;
  status: 'Pendiente' | 'Completada' | 'Cancelada';
  overdue?: boolean;
}

export interface QuoteLine {
  productId: string;
  quantity: number;
  saleUnit: string;
  price: number;
  margin: number;
  freight: number;
  baseUnit?: string;
  length?: number;
  width?: number;
  height?: number;
  unitVolume?: number;
  priceSource?: string;
}

export interface CommercialQuote {
  id: string;
  version: number;
  clientId: string;
  recipient: string;
  contact: string;
  status: 'Borrador' | 'Revisar' | 'Pendiente aprobación de precio' | 'Enviada' | 'Aceptada' | 'Pedido pendiente de integración' | 'Ingresado SAP' | 'Completada' | 'Vencida';
  currency: string;
  exchangeRate: number;
  payment: string;
  delivery: string;
  validity: string;
  notes: string;
  lines: QuoteLine[];
  createdAt: string;
  rootQuoteId?: string;
  plant?: string;
  recipientSap?: string;
  destination?: string;
  opportunityId?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  deliveryAddress?: string;
  shipping?: 'retiro' | 'despacho';
  deliveryMode?: 'unica' | 'parcializada';
  freightPayer?: 'cliente' | 'empresa';
  freightId?: string;
  freightReason?: string;
  expiresAt?: string;
  owner?: string;
}

export interface Product {
  id: string;
  description: string;
  group: string;
  plant: string;
  unit: string;
  weight: number;
  volume: number;
  stock: number;
  cost: number;
}

export interface Freight {
  id: string;
  destination: string;
  region: string;
  plant: string;
  provider: string;
  equipment: string;
  capacity: number;
  rate: number;
}

export interface AgreedPrice {
  id: string;
  clientId: string;
  productId: string;
  plant: string;
  price: number;
  validFrom: string;
  validTo: string;
  status: 'Vigente' | 'Por vencer' | 'Vencido' | 'Pendiente aprobación';
}

export interface SapOrder {
  id: string;
  quoteId: string;
  clientId: string;
  status: 'Confirmado' | 'Preparación' | 'Despachado' | 'Entregado';
  deliveryDate: string;
  total: number;
}
