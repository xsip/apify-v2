import { CineplexxApifiedService } from './cineplexx.apified.service'
import { BrowserService } from '../browser.service'
import express, { Express, Request, Response } from 'express';

(async () => {
  await new BrowserService().setup();
  const cineplexxService = new CineplexxApifiedService()
  const app: Express = express();
  const port = 3333;

  app.get('/',async  (req: Request, res: Response) => {
    await cineplexxService.load();
    res.send(cineplexxService.data);
  });

  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
})();


/*;(async () => {
  await service.load()
  // console.log((await load())[0]);

  setInterval(async () => {
    await service.load()
  }, 60000)
})()*/
