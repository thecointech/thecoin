import type { ElementHandle, Frame, Page } from 'puppeteer';
import type { ClickEvent, ElementData } from './types';
import { log } from '@thecointech/logging';

// type ElementWithProperties = {
//   element: ElementHandle,
//   text: string,
//   box: DOMRect,
//   style: CSSStyleDeclaration,
//   coords: {
//     top: number,
//     right: number,
//     bottom: number,
//     left: number
//   },
//   positionSimilarity: number
// }

export async function getElementForEvent(frame: Page|Frame, event: ClickEvent) {
  const allElems = await frame.$$(event.tagName);

  frame.evaluate(`${getFontData}`);

  const candidates = [];
  for (const el of allElems) {
    if (!await isElementVisible(el)) continue;

    candidates.push(
      await getElementProperties(el, event)
    );
  }

  // const scored = candidates.map(el => ({
  //   element: el.element,
  //   score: scoreElement(el, event)
  // }))

  const sorted = candidates
    .filter(el => el.text == event.text)
    .sort((a, b) => a.positionSimilarity - b.positionSimilarity);
  log.debug(`Found ${sorted.length} potentially matching elements from ${candidates.length} candidates`);

  const candidate = sorted[0];
  log.debug(`Best candiate has  ${candidate?.positionSimilarity} similarity`);
  return candidate?.element;
}

// export async function scoreElement(el: ElementWithProperties, event: ClickEvent) {
  
// }

export async function isElementVisible(elem: ElementHandle) {
  // @ts-ignore
  return await elem.evaluate(el => el.checkVisibility({
    checkOpacity: true,  // Check CSS opacity property too
    checkVisibilityCSS: true // Check CSS visibility property too
  }));
}

export async function getElementProperties(elem: ElementHandle, event: ClickEvent) {
  //@ts-ignore
  const text = await elem.evaluate(el => el.innerText);
  const style = await elem.evaluate(el => getComputedStyle(el));
  const box = await elem.evaluate(el => el.getBoundingClientRect());
  const font = await elem.evaluate(el => getFontData(el as HTMLElement));
  const selector = await elem.evaluate(el => getSelector(el as HTMLElement));
  const coords = await elem.evaluate(el => {
    const box = el.getBoundingClientRect();
    return {
      top: box.top + window.pageYOffset,
      right: box.right + window.pageXOffset,
      bottom: box.bottom + window.pageYOffset,
      left: box.left + window.pageXOffset
    };
  });

  const positionSimilarity = getPositionSimilarity(coords, event);

  return {
    element: elem,
    text,
    font,
    selector,
    box,
    style,
    coords,
    positionSimilarity,
  }
}

function getPositionSimilarity(coords: any, event: ClickEvent) {
  const tops = Math.abs(event.coords.top - coords.top)
  const rights = Math.abs(event.coords.right - coords.right)
  const bottoms = Math.abs(event.coords.bottom - coords.bottom)
  const lefts = Math.abs(event.coords.left - coords.left)
  return tops + rights + bottoms + lefts;
}

export async function registerElementAttrFns(page: Page) {
  await page.evaluateOnNewDocument((fns) => {
    eval(`window.getFrameUrl = ${fns.getFrameUrl};`)
    eval(`window.getSelector = ${fns.getSelector};`)
    eval(`window.getFontData = ${fns.getFontData};`)
    eval(`window.getSiblingText = ${fns.getSiblingText};`)
    eval(`window.getCoords = ${fns.getCoords};`)
    // @ts-ignore
    window.getElementData = (el: HTMLElement): ElementData => ({
      frame: getFrameUrl(),
      tagName: el.tagName,
      selector: getSelector(el),
      coords: getCoords(el),
      siblingText: getSiblingText(el),
    })
  }, {
    getFrameUrl: getFrameUrl.toString(),
    getSelector: getSelector.toString(),
    getFontData: getFontData.toString(),
    getSiblingText: getSiblingText.toString(),
    getCoords: getCoords.toString(),
  });
}

const getFrameUrl = () => {
  // Because this runs in the context of the frame, it's
  // always that frames href
  return location.href
}

// Inspired by: https://stackoverflow.com/questions/42184322/javascript-get-element-unique-selector
export function getSelector(elem: Element) {
  const _getSelector = (elem: HTMLElement, descendentSelector = ''): string => {
    const {
      tagName,
      id,
      parentNode
    } = elem;

    if (tagName === 'HTML') return `HTML${descendentSelector}`;

    const thisSel = (id !== '')
      ? `${tagName}#${CSS.escape(id)}`
      : tagName;

    const selected = document.querySelectorAll(thisSel + descendentSelector);
    if (selected.length == 1) return thisSel + descendentSelector;
    if (selected.length == 0) {
      console.error("Cannot find element with selector: " + thisSel + descendentSelector)
      // Return a selector that still works
      return descendentSelector.slice(2)
    }

    // Skip class names, we don't need them and they
    // can be altered in js to mess us up (eg - on mouseover)
    // if (className) {
    //   const classes = className.split(/\s/);
    //   for (let i = 0; i < classes.length; i++) {
    //     thisSel += `.${classes[i]}`;
    //   }
    // }

    let childIndex = 1;

    for (let e: Element = elem; e.previousElementSibling; e = e.previousElementSibling) {
      childIndex += 1;
    }

    const selector = `${thisSel}:nth-child(${childIndex})${descendentSelector}`;
    if (document.querySelectorAll(selector).length == 1) return selector;

    return parentNode
      ? _getSelector(parentNode as HTMLElement, ` > ${selector}`)
      : selector;
  }

  return _getSelector(elem as HTMLElement);
}

const getCoords = (elem: HTMLElement) => {
  const box = elem.getBoundingClientRect();
  return {
    top: box.top + window.pageYOffset,
    right: box.right + window.pageXOffset,
    bottom: box.bottom + window.pageYOffset,
    left: box.left + window.pageXOffset
  };
}

export function getFontData(elem: Element) {
  const _getFontData = (elem: Element) => {
    const styles = getComputedStyle(elem);
    return {
      font: styles.font,
      color: styles.color,
      size: styles.fontSize,
      style: styles.fontStyle,
    }  
  }
  return _getFontData(elem)
}

const getSiblingText = (el: HTMLElement) => {
  const _getSiblingText = (el: HTMLElement) => {
    const text = el.innerText;
    const findParent = (el: HTMLElement): HTMLElement | null => el?.innerText?.startsWith(text) ? findParent(el.parentElement as HTMLElement) : el;
    const ancestor = findParent(el);
    if (ancestor) {
      // Is this a row?
      const elcoords = getCoords(el);
      const rowcoords = getCoords(ancestor);
      // Is it much higher than element?
      const heightFactor = (
        (rowcoords.bottom - rowcoords.top) /
        (elcoords.bottom - elcoords.top)
      )
      if (heightFactor > 2.5) return undefined;
      const widthFactor = (
        (rowcoords.right - rowcoords.left) /
        (elcoords.right - elcoords.left)
      )
      if (widthFactor < 2.5) return undefined
      const rowText = ancestor.innerText;
      return rowText.split(text)[0]?.trim();
    }
    return undefined;
  }
  return _getSiblingText(el);
}