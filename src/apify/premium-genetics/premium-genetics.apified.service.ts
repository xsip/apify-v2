import { PremiumGeneticsApifyModel } from './model';
import { Apify, ApifyServiceOptions } from '../decorator';
import * as console from 'console';
import * as fs from 'fs';
import { Page } from 'puppeteer';
import { PremiumGeneticsDetailsApifiedService } from './premium-genetics-details.apified.service';
const premiumGeneticDetailService = new PremiumGeneticsDetailsApifiedService();
@Apify<PremiumGeneticsApifyModel>({
  elementContainerSelector: '.p-w',
  single: false,
  childSelectors: {
    outOfStock: {
      selector: '.out-of-stock-label',
      checkIfExists: true,
    },
    productName: '.title.block',
    detailsUrl: {
      selector: 'a',
      getAttribute: 'href',
    },
    genetics: '.title-wrapper > .category',
    productPrice: {
      selector: 'meta[itemprop="price"]',
      getAttribute: 'content',
    },
  },
  transformers: {
    productPrice: async (value) => {
      return parseFloat(value);
    },
    detailsUrl: async (value, obj) => {
      // premiumGeneticDetailService.fetchUrl = value;
      // await premiumGeneticDetailService.load();
      // obj.pricePerUnit = premiumGeneticDetailService.data;
      return value;
    },
    outOfStock: async () => false,
    genetics: async () => 'unknown',
  },
})
export class PremiumGeneticsApifyService
  implements ApifyServiceOptions<PremiumGeneticsApifyModel>
{
  afterPageOpen(page: Page): Promise<void> {
    return;
  }
  data: PremiumGeneticsApifyModel[];
  closePageAfterQuery: boolean;
  async load(): Promise<void> {
    console.log('LOAD');
  }

  async url() {
    console.log('URL');
    return 'https://premium-genetics.com/Stecklinge';
  }

  async onData(data: PremiumGeneticsApifyModel[]) {
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
