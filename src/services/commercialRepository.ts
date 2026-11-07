import { mockActivities, mockAgreedPrices, mockClients, mockCommercialQuotes, mockFreights, mockOpportunities, mockProducts, mockSapOrders } from '../mocks/commercialMocks';
import type { Activity, AgreedPrice, Client, CommercialQuote, Freight, Opportunity, Product, SapOrder } from '../types/commercial';

export interface CommercialRepository {
  clients: () => Promise<Client[]>;
  updateClient: (clientId: string, values: Partial<Client>) => Promise<Client>;
  createOpportunity: (opportunity: Opportunity) => Promise<Opportunity>;
  createActivity: (activity: Activity) => Promise<Activity>;
  opportunities: () => Promise<Opportunity[]>;
  activities: () => Promise<Activity[]>;
  quotes: () => Promise<CommercialQuote[]>;
  products: () => Promise<Product[]>;
  freights: () => Promise<Freight[]>;
  agreedPrices: () => Promise<AgreedPrice[]>;
  sapOrders: () => Promise<SapOrder[]>;
}

export const commercialRepository: CommercialRepository = {
  clients: async () => mockClients,
  createOpportunity: async (opportunity: Opportunity) => { mockOpportunities.push(opportunity); return opportunity; },
  createActivity: async (activity: Activity) => { mockActivities.push(activity); return activity; },
  updateClient: async (clientId: string, values: Partial<Client>) => {
    const index = mockClients.findIndex((client) => client.id === clientId);
    if (index < 0) throw new Error('Cliente no encontrado.');
    mockClients[index] = { ...mockClients[index], ...values };
    return mockClients[index];
  },
  opportunities: async () => mockOpportunities,
  activities: async () => mockActivities,
  quotes: async () => mockCommercialQuotes,
  products: async () => mockProducts,
  freights: async () => mockFreights,
  agreedPrices: async () => mockAgreedPrices,
  sapOrders: async () => mockSapOrders,
};
