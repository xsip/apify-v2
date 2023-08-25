import { YoutubeApifyModel, YoutubeApifyModelOut } from './model'
import { Apify, ApifyServiceOptions } from '../decorator'
import * as fs from 'fs'
import { Page } from 'puppeteer'

@Apify<YoutubeApifyModel>({
  elementContainerSelector: { selector: '#primary' },
  single: true,
  childSelectors: {
    // extracts innerText from .overview-element.seperator h2
    name: '#title',
    channel: '#channel-name',
    subscribers: '#owner-sub-count',
    uploadInfo: '#info',
  },
  transformers: {
    name: async (data, obj) => {
      return data.toLowerCase()
    },
    uploadInfo: async (info, model) => {
      model.views = info.split(' ')[0]
      return info
    },
  },
})
export class YoutubeApifiedService
  implements ApifyServiceOptions<YoutubeApifyModel>
{
  data: YoutubeApifyModel[] = []
  _url =
    'https://www.youtube.com/watch?v=Qql8f0Krh18&list=RDtHXEMP68940&ab_channel=1080PALE'

  async load(): Promise<void> {
    console.log('LOAD')
  }

  async url() {
    console.log('URL')
    return this._url
  }

  async onData(data: YoutubeApifyModel[]) {
    this.data = data
  }
  async afterPageOpen(page: Page) {}

  closePageAfterQuery: boolean = false
}
