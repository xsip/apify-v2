import { WillhabenApifyModel } from './model'
import { Apify, ApifyServiceOptions } from '../decorator'
import * as console from 'console'
import * as fs from 'fs'
import { Page } from 'puppeteer'

@Apify<WillhabenApifyModel>({
  elementContainerSelector: '[id^="search-result-entry-header-"]',
  childSelectors: {
    productName: 'h3',
    productPrice: { selector: 'span', querySelectorAll: true, elementIndex: 0 },
    productDescription: {
      selector: 'span',
      querySelectorAll: true,
      elementIndex: 1
    },
    productDescription2: {
      selector: 'span',
      querySelectorAll: true,
      elementIndex: 2,
      get: 'outerHTML'
    },
    publishDate: 'p'
  },
  transformers: {
    productPrice: async value => {
      return parseInt(value.replace('€', '').replace(/\./, ''))
    }
  }
})
export class WillhabenApifyService
  implements ApifyServiceOptions<WillhabenApifyModel> {
  afterPageOpen(page: Page): Promise<void> {
    return;
  }
  data: WillhabenApifyModel[]
  closePageAfterQuery: boolean
  async load(): Promise<void> {
    console.log('LOAD')
  }

  async url() {
    console.log('URL')
    return 'https://www.willhaben.at/iad/kaufen-und-verkaufen/marktplatz/computer-tablets/notebooks-5831'
  }

  async onData(data: WillhabenApifyModel[]) {
    fs.writeFileSync('wh.json', JSON.stringify(data, null, 2), 'utf-8')
  }
}
