import { ApifyService, Transformers } from './apify.service'
import { Page } from 'puppeteer'

export type ChildApifyOptions<T> = {
  elementContainerSelector: string
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
          | ApifyOptions<U[K]>
      }
    : never
}
export type CustomSelector = {
  selector: string
  checkIfExists?: boolean
  getAttribute?: string
  get?: keyof HTMLElement
  querySelectorAll?: boolean
  elementIndex?: number
}
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

export type ApifyServiceOptions<T = any> = {
  load: () => Promise<void>
  url: () => Promise<string>
  onData: (data: T[]) => Promise<void>
  afterPageOpen: (page: Page) => Promise<void>
  data: T[]
}

export function Apify<T>(options: ApifyOptions<T>): any {
  return function _logic<
    T extends { new (...args: any[]): object } & ApifyServiceOptions<T>,
  >(constructor: T) {
    return class extends constructor {
      load: () => void

      constructor(...args: any[]) {
        super(...args)

        const service = new ApifyService<any>(
          options.single,
          options.elementContainerSelector,
          options.childSelectors,
          options.transformers,
        )
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        super.service = service
        this.load = async () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          await super.load()
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const url = await super.url()
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          await this.onData(
            await service.getElements(
              url,
              'networkidle0',
              false,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              super.afterPageOpen,
            ),
          )
        }

        // this.onData(service.getElements(options.url, 'networkidle0',false))
      }
    }
  }
}
