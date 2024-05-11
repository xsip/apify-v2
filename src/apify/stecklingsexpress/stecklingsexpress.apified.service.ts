import { StecklingsExpressApifyModel } from './model';
import { Apify, ApifyServiceOptions } from '../decorator';
import * as console from 'console';
import * as fs from 'fs';
import { Page } from 'puppeteer';

@Apify<StecklingsExpressApifyModel>({
  elementContainerSelector: '.product-small',
  single: false,
  childSelectors: {
    outOfStock: {
      selector: '.out-of-stock-label',
      checkIfExists: true,
    },
    productName: '.product-title',
    detailsUrl: {
      selector: 'a',
      getAttribute: 'href',
    },
    genetics: '.title-wrapper > .category',
    productPrice: '.woocommerce-Price-amount',
  },
  transformers: {
    productPrice: async (value) => {
      return parseFloat(
        value.replace('€', '').replace('ab', '').replace(/\./, ''),
      );
    },
  },
})
export class StecklingsExpressApifyService
  implements ApifyServiceOptions<StecklingsExpressApifyModel>
{
  afterPageOpen(page: Page): Promise<void> {
    return;
  }
  data: StecklingsExpressApifyModel[];
  closePageAfterQuery: boolean;
  async load(): Promise<void> {
    console.log('LOAD');
  }

  async url() {
    console.log('URL');
    return 'https://stecklingsexpress.at/shop/';
  }

  async onData(data: StecklingsExpressApifyModel[]) {
    data = data.sort(function (a, b) {
      return a.productPrice - b.productPrice;
    });
    data = data.filter(
      (e, i, a) => a.findIndex((e2) => e2.productName === e.productName) === i,
    );
    this.data = data;
    fs.writeFileSync('wh.json', JSON.stringify(data, null, 2), 'utf-8');
  }
}
