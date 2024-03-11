import { Page } from 'puppeteer'
import { BrowserService } from './browser.service'
import { FrontendHandler } from './frontend.handler'
import { CustomSelector } from './decorator'
import { scrollToBottom } from './utils'

export type Transformers<IN, OUT = IN> = {
  [K in keyof IN]?: (
    value: string,
    // value: IN[K] extends readonly unknown[] ? IN[K][number] : IN[K],
    obj: IN,
  ) => Promise<IN[K] extends readonly unknown[] ? IN[K][number] : IN[K]>
}
export type ApifyResponse<T> = Record<keyof T, string>

export class ApifyService<T> {
  constructor(
    private single: boolean,
    private elementContainerSelector: string | CustomSelector,
    private childSelectors: Record<keyof T, any>,
    private transformers: Transformers<T> = {} as Transformers<T>,
    private browserService = new BrowserService(),
  ) {}

  async getElements(
    url: string,
    waitTill: 'networkidle0' | ((page: Page) => Promise<void>) = 'networkidle0',
    closePage = true,
    afterPageOpen?: (page: Page) => Promise<void>,
  ): Promise<ApifyResponse<T>[]> {
    const page: Page = await this.browserService.browser.newPage()
    if (waitTill === 'networkidle0') {
      await this.browserService.awaitNavigation(page, url)
    } else {
      await page.goto(url)
      await waitTill(page)
    }
    await afterPageOpen?.(page)
    await scrollToBottom(page)
    const functions = await this.extractFunctions(this.childSelectors, page)
    console.log(functions)
    page.on('console', msg => {
      console.log(msg.text(), ...msg.args())
    })
    const res: any[] = (await page.evaluate(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (selectors, mainSelector, handler, single: boolean, fns) => {
        eval('window.FrontendHandler = ' + handler)
        const object = new (window[
          'FrontendHandler' as any
        ] as any as typeof FrontendHandler)()
        return object.handle(
          selectors,
          typeof mainSelector == 'object'
            ? mainSelector.selector
            : mainSelector,
          single,
          fns,
        )
      },
      this.childSelectors,
      this.elementContainerSelector,
      FrontendHandler.toString(),
      this.single,
      functions,
    )) as any[]
    for (const entry of res) {
      for (const key of Object.keys(this.transformers)) {
        if (
          typeof entry[key as keyof typeof entry] === 'object' &&
          Array.isArray(entry[key as keyof typeof entry])
        ) {
          const copy = []
          for (const item in entry[key]) {
            copy.push(
              await this.transformers[key as keyof Transformers<T>]?.(
                entry[key][item] as any,
                entry,
              ),
            )
          }
          entry[key] = copy
        } else {
          entry[key as keyof typeof entry] = await this.transformers[
            key as keyof Transformers<T>
          ]?.(entry[key as keyof typeof entry] as any, entry)
        }
      }
    }
    if (closePage) await page.close()
    return res as ApifyResponse<T>[]
  }

  buildFnSelector(selector: string, preSelector?: string) {
    return preSelector ? `${preSelector}_${selector}` : selector
  }

  private async extractFunctions<T = any>(
    childSelectors: Record<keyof T, any>,
    page: Page,
    preSelector: string = '',
    functions: Record<keyof T, boolean> = {} as Record<keyof T, boolean>,
  ) {
    // const functions: Record<keyof T, boolean> = {} as Record<keyof T, boolean>
    for (const fnName in childSelectors) {
      if (
        typeof childSelectors[fnName as unknown as keyof T] === 'object' &&
        childSelectors[fnName as unknown as keyof T].childSelectors
      ) {
        functions = await this.extractFunctions(
          childSelectors[fnName as unknown as keyof T].childSelectors,
          page,
          fnName,
          functions,
        )
      } else if (
        typeof childSelectors[fnName as unknown as keyof T] === 'function' ||
        (Array.isArray(childSelectors[fnName as unknown as keyof T]) &&
          typeof childSelectors[fnName as unknown as keyof T][0] === 'function')
      ) {
        console.log('FNName: ', fnName)
        await page.exposeFunction(
          this.buildFnSelector(fnName, preSelector),
          childSelectors[fnName as unknown as keyof T] as any,
        )
        functions[
          this.buildFnSelector(fnName, preSelector) as unknown as keyof T
        ] = true
      }
    }
    return functions
  }
}
