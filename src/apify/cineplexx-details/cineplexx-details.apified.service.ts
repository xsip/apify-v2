import { CineplexxDetailApifyModel } from './model';
import { Apify, ApifyServiceOptions } from '../decorator';
import * as fs from 'fs';
import { Page } from 'puppeteer';

@Apify<CineplexxDetailApifyModel>({
  elementContainerSelector: { selector: '.filmdetails' },
  single: true,
  childSelectors: {
    // extracts innerText from .overview-element.seperator h2
    imageUrl: '.imageUrl',
  },
})
export class CineplexxDetailsApifiedService
  implements ApifyServiceOptions<CineplexxDetailApifyModel>
{
  data: CineplexxDetailApifyModel[] = [];
  _url: string = undefined;
  async load(): Promise<void> {
    console.log('LOAD');
  }

  async url() {
    console.log('URL', this._url);
    return this._url;
  }

  async onData(data: CineplexxDetailApifyModel[]) {
    this.data = data;
    fs.writeFileSync('cineplexx.json', JSON.stringify(data), 'utf-8');
  }
  async afterPageOpen(page: Page) {}

  closePageAfterQuery: boolean = false;
}
