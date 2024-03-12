import { BrowserService } from '../browser.service';
import express, { Express, Request, Response } from 'express';
import { WardaApifiedService } from './warda.apified.service';
(async () => {
  await new BrowserService().setup();
  const wardaApifiedService = new WardaApifiedService();
  const app: Express = express();
  const port = 3333;

  app.get('/', async (req: Request, res: Response) => {
    await wardaApifiedService.load();
    res.send(wardaApifiedService.data);
  });

  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
})();
