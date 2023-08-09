import { WillhabenApifyService } from './willhaben.apified.service'
import { BrowserService } from '../browser.service'

;(async () => {
  await new BrowserService().setup()
  const service = new WillhabenApifyService()
  await service.load();
  // console.log((await load())[0]);

  setInterval(async () => {
    // console.log((await load())[0]);
  }, 60000)
})()