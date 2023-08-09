import {BrowserService} from '../browser.service'
import express, {Express, Request, Response} from 'express';
import {AmazonApifiedService} from './amazon.apified.service';

(async () => {
  await new BrowserService().setup();
  const amazonService = new AmazonApifiedService()
  const app: Express = express();
  const port = 3333;

  app.get('/',async  (req: Request, res: Response) => {
    await amazonService.load();
    res.send(amazonService.data);
  });

  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
})();