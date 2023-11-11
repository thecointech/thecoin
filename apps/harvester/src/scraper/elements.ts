import type { ElementHandle, Page } from 'puppeteer';
import type { ClickEvent, ElementData } from './types';
import { log } from '@thecointech/logging';
import { sleep } from '@thecointech/async';

type FoundElement = {
  element: ElementHandle<Element>,
  score: number,
} & ElementData


export async function getElementForEvent(page: Page, event: ElementData, timeout=30000) {

  const startTick = Date.now();

  while (startTick + timeout < Date.now()) {
    const frame = await getFrame(page, event);
    // NOTE: We could loosen this to any element
    // That may improve resiliance 
    const allElems = await frame.$$(event.tagName);
  
    const candidates : FoundElement[] = [];
    for (const el of allElems) {
      if (!await isElementVisible(el)) continue;
  
      const props = await getElementProperties(el);
      const score = scoreElement(props, event)
      candidates.push({
        element: el,
        score,
        ...props,
      });
    }
  
    const sorted = candidates.sort((a, b) => a.score - b.score);
    log.debug(`Found ${sorted.length} potentially matching elements from ${candidates.length} candidates`);
  
    const candidate = sorted[0];
    log.debug(`Best candiate has  ${candidate?.score} score`);
    // Max score is 125.  60 is chosen arbitrarily, but
    // works for selector + location, or
    // location + siblings + tagName + text
    if (candidate?.score > 60) {
      // Do we need to worry about multiple candidates?
      if (sorted[1]?.score / candidate.score > 0.9) {
        log.warn(`Second best candidate has  ${sorted[1].score} score`);
      }
      return candidate;
    }
    // Continue waiting
    await sleep(500);
  }
  // Not found, throw
  throw new Error(`Element not found: ${event.selector}`);
}

export async function isElementVisible(elem: ElementHandle) {
  // @ts-ignore checkVisibility is chrome-specific
  return await elem.evaluate(el => el.checkVisibility({
    checkOpacity: true,  // Check CSS opacity property too
    checkVisibilityCSS: true // Check CSS visibility property too
  }));
}

export function getElementProperties(elem: ElementHandle) : Promise<ElementData> {
  // @ts-ignore
  return elem.evaluate(el => window.getElementData(el));
}

function scoreElement(potential: ElementData, original: ElementData) {
  let score = 0;
  if (potential.tagName == original.tagName) score = score + 15;
  if (potential.selector == original.selector) score = score + 40;
  if (potential.font?.color == original.font?.color) score = score + 5;
  if (potential.font?.font == original.font?.font) score = score + 5;
  if (potential.font?.size == original.font?.size) score = score + 5;
  if (potential.font?.style == original.font?.style) score = score + 5;
  if (potential.text == original.text) score = score + 10;
  // Else, we still match if both are a dollar amount
  else if (
    original.text?.trim().match(/^\$[0-9, ]+\.\d{2}$/) &&
    potential.text?.trim().match(/^\$[0-9, ]+\.\d{2}$/)
  ) {
    score = score + 10;
  }

  // up to 4 matching siblings for max 20 pts
  const matchingSiblings = potential.siblingText?.filter(
    t => original.siblingText?.includes(t)
  );
  score = score + Math.min(20, (matchingSiblings?.length ?? 0) * 5);
  
  // up to 20 pts from position
  const positionSimilarity = getPositionSimilarity(potential.coords, original);
  score = score + Math.max(0, 20 - (positionSimilarity / 20));

  // max score is 125
  return score;
} 

async function getFrame(page: Page, click: ElementData) {
  if (!click.frame) {
    return page;
  }
  // wait for any iframe to load
  // await page.waitForSelector('iframe')
  for (let i = 0; i < 20; i++) {
    const maybe = page.frames().find(f => f.name() == click.frame);
    if (maybe) return maybe;

    // back-off and retry
    await sleep(1000);
  }
  // return page.  Who knows, maybe it'll work?
  return page;
}

function getPositionSimilarity(coords: any, event: ElementData) {
  const tops = Math.abs(event.coords.top - coords.top)
  const heights = Math.abs(event.coords.height - coords.height)
  const widths = Math.abs(event.coords.width - coords.width)
  const lefts = Math.abs(event.coords.left - coords.left)
  return tops + heights + widths + lefts;
}

export async function registerElementAttrFns(page: Page) {
  await page.evaluateOnNewDocument((fns) => {
    eval(`window.getFrameUrl = ${fns.getFrameUrl};`)
    eval(`window.getSelector = ${fns.getSelector};`)
    eval(`window.getFontData = ${fns.getFontData};`)
    eval(`window.getSiblingText = ${fns.getSiblingText};`)
    eval(`window.getCoords = ${fns.getCoords};`)
    // @ts-ignore
    window.getElementData = (el: HTMLElement): ClickEvent => ({
      frame: getFrameUrl(),
      tagName: el.tagName,
      selector: getSelector(el),
      coords: getCoords(el),
      text: el.innerText,
      font: getFontData(el),
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
  return {
    top: elem.offsetTop,
    left: elem.offsetLeft,
    height: elem.offsetHeight,
    width: elem.offsetWidth,
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
    // const text = el.innerText;
    //@ts-ignore
    const allTags = [...document.body.getElementsByTagName("*")]
    // const allText: HTMLElement[] = $x('//*/text()').map(e => e.parentElement)
    const allText = allTags.filter(el =>
      el.innerText && 
      el.checkVisibility({
        checkOpacity: true,  // Check CSS opacity property too
        checkVisibilityCSS: true // Check CSS visibility property too
      })
    )

    const elcoords = getCoords(el);
    const candidates = allText.filter(candidate => {
      // Skip yourself
      if (candidate == el) return false
      // Is this a row?
      const rowcoords = getCoords(candidate);
      // If it's off the edge of the page ignore it
      if (rowcoords.left < 0 || rowcoords.top < 0) return false;
      // If it's too large ignore it
      if (rowcoords.height > (elcoords.height * 3)) return false;
      // Is it centered on this node?
      const rowCenter = rowcoords.top + (rowcoords.height / 2)
      const elCenter = elcoords.top + (elcoords.height / 2)
      // We allow for slight offsets of generally 2/3 pixels
      return Math.abs(rowCenter - elCenter) < 2
    })
    return candidates.map(c => c.innerText);
  }
  return _getSiblingText(el);
}