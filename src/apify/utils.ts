import * as jsdom from 'jsdom';

export const sleepAsync = (timeout: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });

export function toHtmlElement<T = HTMLElement>(html: string): T {
  const dom = new jsdom.JSDOM(html);
  return dom.window.document.body as T;
}