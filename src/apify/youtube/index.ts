import { YoutubeApifiedService } from './youtube.apified.service';
import { BrowserService } from '../browser.service';
import express, { Express, Request, Response } from 'express';
(async () => {
  await new BrowserService().setup();
  const youtubeService = new YoutubeApifiedService();
  const app: Express = express();
  const port = 3333;

  app.get('/', async (req: Request, res: Response) => {
    await youtubeService.load();
    res.send(youtubeService.data);
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
