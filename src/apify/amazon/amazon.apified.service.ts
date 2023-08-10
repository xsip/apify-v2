import { AmazonApifyModel } from './model'
import { Apify, ApifyServiceOptions } from '../decorator'
import * as fs from 'fs'
import { Page } from 'puppeteer'
import * as console from 'console'
import * as console from 'console'
import * as fs from 'fs'
@Apify<AmazonApifyModel>({
  elementContainerSelector: '[data-component-type="s-search-result"]',
  childSelectors: {
    productName: {
      selector: '.a-size-mini.a-spacing-none.a-color-base.s-line-clamp-2',
      get: 'innerText',
    }, // extracts innerText from .overview-element.seperator h2
    price: '.a-price-whole',
  },
})
export class AmazonApifiedService
  implements ApifyServiceOptions<AmazonApifyModel>
{
  data: AmazonApifyModel[] = []
  async load(): Promise<void> {
    console.log('LOAD')
  }

  async url() {
    console.log('URL')
    return 'https://www.amazon.de/s?k=fernseher&__mk_de_DE=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2DJJ5GR59D1IW&sprefix=fernsehe%2Caps%2C138&ref=nb_sb_noss_2'
  }

  async onData(data: AmazonApifyModel[]) {
    this.data = data
    fs.writeFileSync('amazon.json', JSON.stringify(data), 'utf-8')
  }
  async afterPageOpen(page: Page) {}

  closePageAfterQuery: boolean = false
}
