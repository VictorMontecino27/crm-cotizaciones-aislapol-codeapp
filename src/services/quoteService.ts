import { commercialRepository } from './commercialRepository';

export interface QuoteRepository {
  list: typeof commercialRepository.quotes;
  products: typeof commercialRepository.products;
  agreedPrices: typeof commercialRepository.agreedPrices;
  freights: typeof commercialRepository.freights;
}

export const quoteService: QuoteRepository = {
  list: commercialRepository.quotes,
  products: commercialRepository.products,
  agreedPrices: commercialRepository.agreedPrices,
  freights: commercialRepository.freights,
};
