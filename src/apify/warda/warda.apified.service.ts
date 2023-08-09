import { WardaApifyModel } from './model'
import { Apify, ApifyServiceOptions } from '../decorator'
import * as fs from 'fs'
import { Page } from 'puppeteer'
import { scrollToBottom, sleepAsync } from '../utils'

@Apify<WardaApifyModel>({
  elementContainerSelector: '.event_box',
  childSelectors: {
    eventName: '.event_details h3', // extracts innerText from .overview-element.seperator h2
    tags: ['.tag_category_names a'],
    image: { selector: '.event_image img', getAttribute: 'src' },
    location: '.event_time',
  },
})
export class WardaApifiedService
  implements ApifyServiceOptions<WardaApifyModel>
{
  async load(): Promise<void> {
    console.log('LOAD')
  }

  async url() {
    console.log('URL')
    return 'https://warda.at/events/'
  }

  async onData(data: WardaApifyModel[]) {
    this.data = data
    fs.writeFileSync('warda.json', JSON.stringify(data), 'utf-8')
  }
  async afterPageOpen(page: Page) {
    await page.evaluate(() => {
      document.getElementById('date_today').click()
    })
    await sleepAsync(5000)
  }

  data: WardaApifyModel[] = []
}
