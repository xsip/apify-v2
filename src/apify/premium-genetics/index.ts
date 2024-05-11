import { PremiumGeneticsApifyService } from './premium-genetics.apified.service';
import { BrowserService } from '../browser.service';
import express, { Express, Request, Response } from 'express';

(async () => {
  await new BrowserService().setup();
  const service = new PremiumGeneticsApifyService();
  const app: Express = express();
  const port = 3333;

  app.get('/', async (req: Request, res: Response) => {
    await service.load();
    res.send(service.data);
  });

  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
})();
