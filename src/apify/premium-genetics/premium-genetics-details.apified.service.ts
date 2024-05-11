import { PremiumGeneticsPricePerUnit } from './model';
import { Apify, ApifyServiceOptions } from '../decorator';
import * as console from 'console';
import { Page } from 'puppeteer';

@Apify<PremiumGeneticsPricePerUnit>({
  elementContainerSelector: '[class^="bulk-price-"]',
  single: false,
  childSelectors: {
    unit: '.text-right',
    price: '.text-right.bulk-price',
  },
  transformers: {
    price: async (value) => {
      return parseFloat(
        value.replace('*', '').replace('€', '').replace(',', '.'),
      );
    },
    unit: async (value) => {
      return parseInt(value);
    },
  },
})
export class PremiumGeneticsDetailsApifiedService
  implements ApifyServiceOptions<PremiumGeneticsPricePerUnit>
{
  fetchUrl = '';
  afterPageOpen(page: Page): Promise<void> {
    return;
  }
  data: PremiumGeneticsPricePerUnit[];
  closePageAfterQuery: boolean;
  async load(): Promise<void> {
    console.log('LOAD');
  }

  async url() {
    console.log('URL');
    return this.fetchUrl;
  }

  async onData(data: PremiumGeneticsPricePerUnit[]) {
    data = data.sort(function (a, b) {
      return a.unit - b.unit;
    });
    this.data = data;
  }
}
