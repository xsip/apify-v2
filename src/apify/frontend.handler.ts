import { map } from 'lodash'

export class FrontendHandler {
  async handle<T>(
    selectors: Record<keyof T, any>,
    elementContainerSelector: string,
    single: boolean,
    fns: Record<keyof T, boolean>,
  ) {
    let responses: any[] = []
    if (!single) {
      responses = await this.getResponseMulti(
        fns,
        responses,
        elementContainerSelector,
        selectors,
      )
    } else {
      responses = await this.getResponseSingle(
        fns,
        responses,
        elementContainerSelector,
        selectors,
      )
    }

    return responses
  }

  async getResponseSingle<T = any>(
    fns: Record<string, boolean>,
    responses: any[],
    topLevelSelector: string,
    selectors: Record<keyof T, any>,
    _element: any = document,
    selector?: string,
    object?: any,
  ) {
    /*return*/
    const element = _element.querySelector(topLevelSelector)
    let response: Record<keyof T, unknown> = {} as Record<keyof T, unknown>

    const __ret = await this.handleElement(
      selectors,
      fns,
      selector,
      response,
      element,
      responses,
    )
    response = __ret.response
    responses = __ret.responses
    if (object) {
      object[selector] = response
    } else {
      responses.push(response)
    }

    return responses
  }

  async getResponseMulti<T = any>(
    fns: Record<string, boolean>,
    responses: any[],
    topLevelSelector: string,
    selectors: Record<keyof T, any>,
    _element: any = document,
    selector?: string,
    object?: any,
  ) {
    /*return*/
    for (const element of [
      ..._element.querySelectorAll(topLevelSelector),
    ]) /*.map((element) =>*/ {
      let response: Record<keyof T, unknown> = {} as Record<keyof T, unknown>

      const __ret = await this.handleElement(
        selectors,
        fns,
        selector,
        response,
        element,
        responses,
      )

      response = __ret.response
      responses = __ret.responses
      if (object) {
        if (!object[selector]) {
          object[selector] = []
        }
        object[selector].push(response)
      } else {
        responses.push(response)
      }
    }

    return responses
  }

  private async handleElement<T>(
    selectors: Record<keyof T, any>,
    fns: Record<string, boolean>,
    selector: string,
    response: Record<keyof T, unknown>,
    element: any,
    responses: any[],
  ) {
    for (const _key of [
      ...Object.keys(selectors),
      ...Object.keys(fns),
    ]) /*.forEach((key) =>*/ {
      const key = _key as keyof T
      if (fns[this.buildFnSelector(key, selector)]) {
        response = await this.handleFn(response, element, key, selector)
        if ((key as string).includes('room')) {
        }
      } else if (typeof selectors[key] === 'string') {
        response[key] = this.handleStringSelector(element, selectors, key)
      } else if (
        typeof selectors[key] === 'object' &&
        Array.isArray(selectors[key])
      ) {
        response[key] = await this.handleArraySelector(element, selectors, key)
      } else if (typeof selectors[key] === 'object') {
        responses = await this.handleObject(
          selectors,
          key,
          responses,
          fns,
          element,
          response,
        )
      }
    } // );
    return { response, responses }
  }

  private async handleObject<T>(
    selectors: Record<keyof T, any>,
    key: keyof T,
    responses: any[],
    fns: Record<string, boolean>,
    element: any,
    response: Record<keyof T, unknown>,
  ) {
    if (selectors[key].elementContainerSelector) {
      if (!selectors[key].single) {
        responses = await this.getResponseMulti(
          fns,
          responses,
          selectors[key].elementContainerSelector,
          selectors[key].childSelectors,
          element,
          key as any,
          response,
        )
      } else {
        responses = await this.getResponseSingle(
          fns,
          responses,
          selectors[key].elementContainerSelector,
          selectors[key].childSelectors,
          element,
          key as any,
          response,
        )
      }
    } else if (selectors[key].selector) {
      const targetElement: HTMLElement = element.querySelector(
        selectors[key].selector,
      ) as unknown as HTMLElement
      if (selectors[key].querySelectorAll && selectors[key].elementIndex >= 0) {
        response[key] = (
          element.querySelectorAll(
            selectors[key].selector,
          ) as unknown as HTMLElement[]
        )?.[selectors[key].elementIndex]?.[
          (selectors[key].get ?? 'innerText') as any as keyof HTMLElement
        ]
      } else if (selectors[key].checkIfExists) {
        response[key] = !!targetElement
      } else if (selectors[key].getAttribute) {
        response[key] = targetElement?.getAttribute(selectors[key].getAttribute)
      } else if (selectors[key].get) {
        if (Array.isArray(selectors[key].get)) {
          let prop: any
          for (const propPath of selectors[key].get) {
            if (!prop) {
              prop = targetElement?.[propPath as keyof HTMLElement]
            } else {
              prop = prop[propPath]
            }
            response[key] = prop
          }
        } else {
          let prop: any =
            targetElement?.[selectors[key].get as keyof HTMLElement]
          if (typeof prop === 'function') {
            prop = prop()
          }
          response[key] = prop
        }
      } else {
        response[key] =
          (element.querySelector(selectors[key]) as unknown as HTMLElement)
            ?.innerText ?? ('' as any)
      }
    }
    return responses
  }

  private async handleFn<T>(
    response: Record<keyof T, unknown>,
    element: any,
    key: keyof T,
    selector: string,
  ) {
    if (!response) {
      response = {} as any
    }

    // fns[buildFnSelector(key, selector) as keyof T]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    window.el = element
    const splitted = (key as string).split('_')
    const res = await eval(
      `${this.buildFnSelector(key, selector)}(window.el.outerHTML);`,
    )
    if ((key as string).split('_').length === 1) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      response[key] = res
    } else if ((key as string).split('_').length === 2) {
      if (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        typeof response[splitted[0]][splitted[1]] === 'object' &&
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        Array.isArray(response[splitted[0]][splitted[1]])
      ) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        response[splitted[0]][splitted[1]].push(res)
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        response[splitted[0]][splitted[1]] = res
      }
    } else if ((key as string).split('_').length === 3) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      response[splitted[0]][splitted[1]][splitted[2]] = res
    } else if ((key as string).split('_').length === 4) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      response[splitted[0]][splitted[1]][splitted[2]][splitted[3]] = res
    }

    return response
  }

  handleStringSelector<T>(
    element: HTMLElement,
    selectors: Record<keyof T, any>,
    key: keyof T,
  ) {
    return (
      (element.querySelector(selectors[key]) as unknown as HTMLElement)
        ?.innerText ?? ('' as any)
    )
  }

  async handleArraySelector<T>(
    element: HTMLElement,
    selectors: Record<keyof T, any>,
    key: keyof T,
    fns?: any,
  ) {
    const selector = selectors[key][0]

    if (selector.selector) {
      const targetElements: HTMLElement[] = [
        ...(element.querySelectorAll(
          selector.selector,
        ) as unknown as HTMLElement[]),
      ]
      if (selector.getAttribute) {
        return targetElements.map(e => {
          return e.getAttribute(selector.getAttribute)
        })
      } else if (selector.get) {
        return targetElements.map(e => {
          let prop: any = e?.[selector.get as keyof HTMLElement]
          if (typeof prop === 'function') {
            prop = prop()
          }
          return prop
        })
      }
      return targetElements.map(e => e.innerText)
    }
    return [
      ...(element.querySelectorAll(selector) as unknown as HTMLElement[]),
    ].map(e => e.innerText)
  }

  buildFnSelector(selector: any, preSelector?: any) {
    return preSelector ? `${preSelector}_${selector}` : selector
  }
}
