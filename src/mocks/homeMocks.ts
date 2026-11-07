export type QuoteStatus = 'Revisar' | 'Enviada' | 'Ingresado SAP' | 'Completada';

export interface HomeQuote {
  id: string;
  version: number;
  client: string;
  total: number;
  delivery: string;
  status: QuoteStatus;
}

export interface HomeActivity {
  id: string;
  date: string;
  subject: string;
  status: 'Pendiente' | 'Completada';
  overdue?: boolean;
}

export const mockUser = {
  name: 'Usuario Demo Comercial',
  initials: 'UD',
};

export const mockQuotes: HomeQuote[] = [
  { id: 'CT-0001', version: 1, client: 'Cliente demo norte', total: 1485000, delivery: '12/11/2026', status: 'Revisar' },
  { id: 'CT-0002', version: 2, client: 'Cliente demo centro', total: 875000, delivery: '14/11/2026', status: 'Enviada' },
  { id: 'CT-0003', version: 1, client: 'Cliente demo sur', total: 2320000, delivery: '18/11/2026', status: 'Ingresado SAP' },
  { id: 'CT-0004', version: 1, client: 'Cliente demo industrial', total: 642000, delivery: '20/11/2026', status: 'Completada' },
  { id: 'CT-0005', version: 3, client: 'Cliente demo metropolitano', total: 1190000, delivery: '22/11/2026', status: 'Enviada' },
];

export const mockActivities: HomeActivity[] = [
  { id: 'ACT-01', date: '07/11/2026', subject: 'Seguimiento de cotización', status: 'Pendiente', overdue: true },
  { id: 'ACT-02', date: '09/11/2026', subject: 'Visita comercial de demostración', status: 'Pendiente' },
  { id: 'ACT-03', date: '11/11/2026', subject: 'Revisión técnica con cliente demo', status: 'Pendiente' },
];
