import { CineplexxApifyModel } from './model'
import { Apify, ApifyServiceOptions } from '../decorator'
import * as fs from 'fs'
import { toHtmlElement } from '../utils'
import { CineplexxDetailsApifiedService } from '../cineplexx-details/cineplexx-details.apified.service'
import { Page } from 'puppeteer'

const detailService: CineplexxDetailsApifiedService =
  new CineplexxDetailsApifiedService()

@Apify<CineplexxApifyModel>({
  elementContainerSelector: { selector: '.span3:has(.img-holder)' },
  childSelectors: {
    // extracts innerText from .overview-element.seperator h2
    movieName: 'h2',
    url: { selector: 'h2 > a', getAttribute: 'href' },
    imageUrl: { selector: '.content-image.lazy', getAttribute: 'src' },
  },
  transformers: {
    movieName: async (data, obj) => {
      return data.toLowerCase()
    },

    url: async data => {
      return 'https:' + data
    },

    imageUrl: async data => {
      return 'https:' + data
    },
  },
})
export class CineplexxApifiedService
  implements ApifyServiceOptions<CineplexxApifyModel>
{
  data: CineplexxApifyModel[] = []
  _url = 'https://www.cineplexx.at/filme/bald-im-kino/'

  async load(): Promise<void> {
    console.log('LOAD')
  }

  async url() {
    console.log('URL')
    return this._url
  }

  async onData(data: CineplexxApifyModel[]) {
    this.data = data
    fs.writeFileSync('cineplexx.json', JSON.stringify(data), 'utf-8')
  }
  async afterPageOpen(page: Page) {}
}
