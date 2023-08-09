# APIFY
### Create APIs out of Webpages


## Example Apified Class
```typescript
@Apify<CineplexxApifyModel>({
  elementContainerSelector: { selector: '.span3:has(.img-holder)' },
  childSelectors: {
    movieName: 'h2',
    url: { selector: 'h2 > a', getAttribute: 'href' },
    imageUrl: { selector: '.content-image.lazy', getAttribute: 'src' },
  },
  transformers: {
    movieName: async (data, obj) => {
      return data.toLowerCase()
    },

    url: async data => {
      return 'https:' + data
    },

    imageUrl: async data => {
      return 'https:' + data
    },
  },
})
export class CineplexxApifiedService
  implements ApifyServiceOptions<CineplexxApifyModel>
{
  data: CineplexxApifyModel[] = []
  _url = 'https://www.cineplexx.at/filme/bald-im-kino/'

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
}
```

## Example usage using express server

```typescript
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
```


# API

## Class
### Implements ApifyServiceOptions\<T>
#### A Apify class needs to implement the ```ApifyServiceOptions<T>``` interface and define the following functions
#### Function ```async url(): Promise<string>```. This function will return the URL which apify will use to scrap data from.
#### Function ```async load(): Promise<void>```. This function will be called before the actual fetch/scrap process. Call it to trigger the data extraction!
#### Function ```async onDataa(data: T): Promise<void>```. This function will be called After the data has been fetched. Do whatever you want with it!
#### Function ```async afterPageOpen(page: Puppeteer.Page): Promise<void>```. This function will be called After the navigation to the page has been done. From here you can execute in the page's context or do other stuff using the Page Object.
## Decorator Object
```typescript
export type ApifyOptions<T> = {
  elementContainerSelector: string | CustomSelector
  single?: boolean
  childSelectors?: (
    T extends readonly unknown[] ? T[number] : T
    ) extends infer U
    ? {
      [K in keyof U]?:
      | string
      | [string]
      | ((element: string) => void)
      | CustomSelector
      | ChildApifyOptions<U[K]>
    }
    : never
  transformers?: Transformers<T>
}
```
### Basic Properties
#### The ```elementContainerSelector``` defines the Root Element which gets queried by using ```querySelectorAll``` until```single``` is set to true. Then only one element will be queried.
#### ```Child selectors``` can either be an ```Record of  CustomSelector```,```Record of String```, ```Record of [String]``` or ```the same element as the root element``` recursively.

### Transformers
#### ```Transformers are async, will be awaited``` and get executed after all Data has been fetched and tranforms properties for a Element OR Each Element in case of an array according to your functions. 

```typescript
export type Transformers<T> = {
  [K in keyof T]?: (
    value: T[K] extends readonly unknown[] ? T[K][number] : T[K],
    obj: T,
  ) => Promise<any>
}
```
#### You will get access to the object used by the key and also the complete object itself.


## Selectors

### Selector can be a custom selector:
```typescript
export type CustomSelector = {
  selector: string
  checkIfExists?: boolean
  getAttribute?: string
  get?: keyof HTMLElement
  querySelectorAll?: boolean
  elementIndex?: number
}
```
#### the property ```selector``` is a selector which will be used internally using the ```querySelector``` api.
#### if ```checkIfExists``` is set, the value will be a ```boolean```.
#### ```getAttribute``` extracts an attribute value from the queried Element.
#### if ```get``` is set to ```innerHtml``` for example, the return value will be the elements ```innerHtml``` queried by the ```selector``` property.
#### if ```querySelectorAll``` is set you must provide a ```elementIndex``` to define which element should be returned.
###
### Simple string: ( returns  ```<element>.innerText```)
```typescript
string
```
### A string array: ( same as "Simple string" but returns array of innerTexts)
```typescript
[string]
```

While a ```custom selector``` or ```string selector``` will fetch one element, the ```string array selector``` will fetch multiple Elements.
