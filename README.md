# APIFY
### Create APIs out of Webpages


## Example Apified Class
```typescript
import { WardaApifyModel } from './model'
import { Apify, ApifyServiceOptions } from '../decorator'
import * as fs from 'fs'
import { Page } from 'puppeteer'
import { sleepAsync } from '../utils'

@Apify<WardaApifyModel>({
  elementContainerSelector: '.event_box',
  childSelectors: {
    eventName: '.event_details h3',
    tags: [{ selector: '.tag_category_names a' }],
    tags2: {
      selector: '.tag_category_names',
      get: ['nextElementSibling', 'innerHTML'],
    },
    image: { selector: '.event_image img', getAttribute: 'src' },
    location: '.event_time',
  },
  transformers: {
    tags: async tag => {
      return tag + '[TEST]'
    },
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

  closePageAfterQuery: boolean = true
}

```

## Example usage using express server

```typescript
import { BrowserService } from '../browser.service'
import express, { Express, Request, Response } from 'express'
import { WardaApifiedService } from './warda.apified.service'
  ;(async () => {
  await new BrowserService().setup()
  const wardaApifiedService = new WardaApifiedService()
  const app: Express = express()
  const port = 3333

  app.get('/', async (req: Request, res: Response) => {
    await wardaApifiedService.load()
    res.send(wardaApifiedService.data)
  })

  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
  })
})()

```
## Extension Loader Service
#### The extension loader service will automatically load chrome extensions placed in the ``extensions folder``. ( AdBlock is pre-installed.)

# API

## Class
### Implements ApifyServiceOptions\<T>
#### A Apify class needs to implement the ```ApifyServiceOptions<T>``` interface and define the following functions
#### Function ```closePageAfterQuery: boolean```. This boolean will decide if the page is closed after querying data.
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

### Selector can be a custom selector array
```typescript
export type CustomSelectorArray = [
  {
    selector: string
    getAttribute?: string
    get?: keyof HTMLElement
  },
]
```
#### the property ```selector``` is a selector which will be used internally using the ```querySelectorAll``` api.
#### ```getAttribute``` extracts an attribute value from the queried Elements.
#### if ```get``` is set to ```innerHtml``` for example, the return value will be an arry of elements ```innerHtml``` queried by the ```selector``` property. Get can also be an ``array``, where ```['nextElementSibling', 'innerHTML]``` for example will return the innerHTML of the next sibling.

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
