import { CineplexxApifyModel } from './model'
import { Apify, ApifyServiceOptions } from '../decorator'
import * as fs from 'fs'
import { toHtmlElement } from '../utils'
import { CineplexxDetailsApifiedService } from '../cineplexx-details/cineplexx-details.apified.service'
import { Page } from 'puppeteer'

const detailService: CineplexxDetailsApifiedService =
  new CineplexxDetailsApifiedService()

@Apify<CineplexxApifyModel>({
  single: false,
  elementContainerSelector: { selector: '.l-entity__item' },
  childSelectors: {
    // extracts innerText from .overview-element.seperator h2
    movieName: '.l-entity__figure-caption',
    url: { selector: '.l-entity__item-link', getAttribute: 'href' },
    imageUrl: { selector: '.b-image-with-loader__img', getAttribute: 'src' },
    startDate: '.l-entity__figure-caption_startDate'
  },
  transformers: {
    movieName: async (data, obj) => {
      return data.toLowerCase()
    },

    url: async data => {
      return 'https://www.cineplexx.at' + data
    },

    imageUrl: async data => {
      return  data
    },
  },
})
export class CineplexxApifiedService
  implements ApifyServiceOptions<CineplexxApifyModel>
{
  data: CineplexxApifyModel[] = []
  _url = 'https://www.cineplexx.at/film?category=upcoming&date=all'

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

  closePageAfterQuery: boolean = false
}
