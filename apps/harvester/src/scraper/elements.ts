import type { ElementHandle, Page } from 'puppeteer';
import type { ElementData } from './types';
import { log } from '@thecointech/logging';
import { sleep } from '@thecointech/async';

type FoundElement = {
  element: ElementHandle<Element>,
  score: number,
} & ElementData

declare let window: Window & {
  getElementData: (el: HTMLElement) => ElementData
};

export async function getElementForEvent(page: Page, event: ElementData, timeout=30000) {

  const startTick = Date.now();

  while (Date.now() < startTick + timeout) {
    const frame = await getFrame(page, event);
    // NOTE: We could loosen this to any element
    // That may improve resiliance 
    const allElems = await frame.$$(event.tagName)
    const allProps = await frame.evaluate((...els) => 
      els.map(el => ({
        //@ts-ignore
        isVisible: el.checkVisibility({
        checkOpacity: true,  // Check CSS opacity property too
        checkVisibilityCSS: true // Check CSS visibility property too
        }),
        ...window.getElementData(el as HTMLElement)
      })), ...allElems)

    const candidates = allElems
      .map((el, i) => ({
        element: el,
        ...allProps[i],
      }))
      .filter(el => el.isVisible)
      .map(el => ({
        ...el,
        score: scoreElement(el, event)
      }));

    // const candidates : FoundElement[] = [];
    // for (const el of allElems) {
    //   const score = scoreElement(el, event)
    //   candidates.push({
    //     score,
    //     ...el,
    //     element: el.element as any
    //   });
    // }
  
    const sorted = candidates.sort((a, b) => b.score - a.score);
    log.debug(`Found ${sorted.length} potentially matching elements from ${candidates.length} candidates, best: ${sorted[0]?.score}, second best: ${sorted[1]?.score}`);
    const candidate = sorted[0];
    // Max score is 125.  70 is chosen arbitrarily, but
    // works for selector + location + tagName, or
    // location + siblings + tagName + text + font
    if (candidate?.score >= 70) {
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
  if (potential.siblingText?.length && original.siblingText?.length) {
    const matched = potential.siblingText.filter(
      t => original.siblingText?.includes(t)
    );
    if (matched.length > 0) {
      // Max score for perfect match, but decreases with each miss
      // Eg, 1 matched, 1 unmatched = 50% score
      // Eg, 1 matched, 2 unmatched = 33% score
      // Eg, 3 matched, 1 unmatched = 75% score
      const unmatched = (
        potential.siblingText.length - matched.length + 
        original.siblingText.length - matched.length
      )
      score = score + (20 * matched.length / (unmatched  + matched.length));
    }
  }
  
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
    window.getElementData = (el: HTMLElement): ElementData => ({
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

const getCoords = (elem: Element) => {
  const box = elem.getBoundingClientRect();
  return {
    top: box.top + window.scrollY,
    left: box.left + window.scrollX,
    height: box.height,
    width: box.width,
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
    const walker = el.ownerDocument.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );

    const textNodes = [];
    let node: Node|null;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    // const allText: HTMLElement[] = $x('//*/text()').map(e => e.parentElement)
    const allText = textNodes.filter(el =>
      el.textContent?.trim() && 
      el.parentElement?.checkVisibility({
        checkOpacity: true,  // Check CSS opacity property too
        checkVisibilityCSS: true // Check CSS visibility property too
      })
    )

    const elcoords = getCoords(el);
    const candidates = allText.filter(candidate => {
      // Skip yourself
      if (candidate == el || !candidate.parentElement) return false
      // Is this a row?
      const rowcoords = getCoords(candidate.parentElement);
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
    return candidates.map(c => c.textContent).filter(t => !!t) as string[];
  }
  return _getSiblingText(el);
}