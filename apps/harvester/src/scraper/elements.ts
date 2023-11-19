import type { ElementHandle, Frame, Page } from 'puppeteer';
import type { Coords, ElementData } from './types';
import { log } from '@thecointech/logging';
import { sleep } from '@thecointech/async';

type FoundElement = {
  element: ElementHandle<Element>,
  score: number,
  data: ElementData
}

declare let window: Window & {
  getElementData: (el: HTMLElement, skipSibling?: boolean) => ElementData
};

export async function getElementForEvent(page: Page, event: ElementData, timeout=30000) {

  const startTick = Date.now();

  while (Date.now() < startTick + timeout) {
    const frame = await getFrame(page, event);

    const elements = await getAllElements(frame);
    const withSiblings = fillOutSiblingText(elements);

    const candidates = withSiblings.reduce((acc, el) => {
      acc.push({
        ...el,
        score: scoreElement(el.data, event),
      })
      return acc;
    }, [] as FoundElement[]);

    // Sort by score to see if any element is close enough
    const sorted = candidates.sort((a, b) => b.score - a.score);
    log.debug(`Found ${sorted.length} candidates, best: ${sorted[0]?.score}, second best: ${sorted[1]?.score}`);
    const candidate = sorted[0];

    // Extra debugging
    if (process.env.VERBOSE_COIN_SCRAPER) {
      log.debug(`Text: ${event.text} - ${candidate?.data?.text}`);
      log.debug(`Label: ${event.label} - ${candidate?.data?.label}`);
      log.debug(`Coords: ${JSON.stringify(event.coords)} - ${JSON.stringify(candidate?.data?.coords)}`);
      log.debug(`Siblings: ${JSON.stringify(event.siblingText)} - ${JSON.stringify(candidate?.data?.siblingText)}`);
    }

    const elapsed = Date.now() - startTick;
    log.info(`Search took: ${(elapsed / 1000).toFixed(2)}ms`)

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

function scoreElement(potential: ElementData, original: ElementData) {
  let score = 0;
  if (potential.tagName == original.tagName) score = score + 10;
  if (potential.selector == original.selector) score = score + 30;
  if (potential.font?.color == original.font?.color) score = score + 5;
  if (potential.font?.font == original.font?.font) score = score + 5;
  if (potential.font?.size == original.font?.size) score = score + 5;
  if (potential.font?.style == original.font?.style) score = score + 5;
  if (potential.text == original.text) score = score + 20;
  // Else, we still match if both are a dollar amount
  else if (
    original.text?.trim().match(/^\$[0-9, ]+\.\d{2}$/) &&
    potential.text?.trim().match(/^\$[0-9, ]+\.\d{2}$/)
  ) {
    score = score + 20;
  }

  if (
    potential.role && original.role &&
    potential.role == original.role
  ) {
    score = score + 15;
  }
  else if (potential.role != original.role) {
    score = score - 5;
  }
  if (
    potential.label &&  original.label &&
    potential.label == original.label
  ) {
    score = score + 30;
  }
  else if (potential.label != original.label) {
    score = score - 10;
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
  // If neither have any siblings, mark as 10 pts cause that's pretty close
  else if (potential.siblingText?.length == original.siblingText?.length) {
    score = score + 10;
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
    eval(`window.getElementProps = ${fns.getElementProps};`)
    eval(`window.getFrameUrl = ${fns.getFrameUrl};`)
    eval(`window.getSelector = ${fns.getSelector};`)
    eval(`window.getFontData = ${fns.getFontData};`)
    eval(`window.getElementText = ${fns.getElementText};`)
    eval(`window.getSiblingText = ${fns.getSiblingText};`)
    eval(`window.getCoords = ${fns.getCoords};`)
    window.getElementData = (el: HTMLElement, skipSibling?: boolean) => {
      const r: ElementData = getElementProps(el);
      if (!skipSibling) {
        const allNodes = document.querySelectorAll("*");
        const potentialSiblings = Array.from(allNodes)
          .filter(ps => (
            ps != el && 
            //@ts-ignore
            ps.checkVisibility({
              checkOpacity: true,  // Check CSS opacity property too
              checkVisibilityCSS: true // Check CSS visibility property too
            })
          ))
          .map(ps => ({
            element: ps,
            coords: getCoords(ps),
            nodeValue: getElementText(ps),
          }))
          .filter(ps => !!ps.nodeValue)
        r.siblingText = getSiblingText(r.coords, potentialSiblings);
      }
      return r;
    }
  }, {
    getElementProps: getElementProps.toString(),
    getFrameUrl: getFrameUrl.toString(),
    getSelector: getSelector.toString(),
    getFontData: getFontData.toString(),
    getElementText: getElementText.toString(),
    getSiblingText: getSiblingText.toString(),
    getCoords: getCoords.toString(),
  });
}

const getElementProps = (el: HTMLElement) => ({
  frame: getFrameUrl(),
  tagName: el.tagName,
  role: el.getAttribute("role"),
  selector: getSelector(el),
  coords: getCoords(el),
  font: getFontData(el),
  label: el.getAttribute("aria-label"),
  text: el.innerText,
  nodeValue: getElementText(el),  
})

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

function getElementText(elem: Element) {
  return Array.from(elem.childNodes)
    .filter(n => n.nodeType == 3)
    .map(n => n.nodeValue)
    .join(" ")
    .replace(/\s+/, ' ')
    .trim()
}

const getSiblingText = (elcoords: Coords, allText: Pick<ElementData, 'coords'|'nodeValue'>[]) => allText
  .filter(c => !!c.nodeValue)
  .filter(candidate => {
    // Is this a row?
    const rowcoords = candidate.coords;
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
  .map(c => c.nodeValue) as string[];

type SearchElement = {
  element: ElementHandle<HTMLElement>,
  data: ElementData
}

export const getAllElements = async (frame: Page|Frame) => {
  // const allElements = await frame.$x("//text()")
  const allElements = await frame.$$("*")
  const allData: (ElementData|null)[] = await frame.evaluate(
    (...els) => els.map(el => 
      (
        el instanceof HTMLElement
        //@ts-ignore
        // && el.checkVisibility({
        //   checkOpacity: true,  // Check CSS opacity property too
        //   checkVisibilityCSS: true // Check CSS visibility property too
        // })
      ) ? getElementProps(el)
        : null
    ),
    ...allElements
  )

  return allData.reduce((r, data, i) => {
    // If it's off the edge of the page ignore it
    if (!data || data.coords.left < 0 || data.coords.top < 0) return r
    r.push({
      element: allElements[i] as ElementHandle<HTMLElement>,
      data
    })
    return r
  }, [] as SearchElement[])
}

const BUCKET_PIXELS = 10
const getBuckets = (coords: Coords) => {
  const center = coords.top + (coords.height / 2);
  return Math.floor(center / BUCKET_PIXELS);
}

// fill out sibling text for each element in the tree.
// This is an O(n^2) operation, so we use a bucketing approach
const fillOutSiblingText = (allElements: SearchElement[]) => {
  // Implement bucketting to optimize the search time for sibling text
  const bucketed: SearchElement[][] = [];
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];
    const bucket = getBuckets(el.data.coords);
    if (!bucketed[bucket]) bucketed[bucket] = [el]
    else bucketed[bucket].push(el)        
  }

  // Now fill out the siblings
  for (let bidx = 0; bidx < bucketed.length; bidx++) {
    const bucket = bucketed[bidx];
    if (!bucket) continue;

    for (let i = 0; i < bucket.length; i++) {
      const el = bucket[i];
      const elcoords = el.data.coords;
      const center = elcoords.top + (elcoords.height / 2)
      const neighbours = (center % BUCKET_PIXELS)  < (BUCKET_PIXELS / 2) 
        ? bucketed[bidx - 1]
        : bucketed[bidx + 1]

      const candidates = [
        ...bucket.filter(e => e != el),
        ...(neighbours || [])
      ].filter(el => !!el.data.nodeValue)

      el.data.siblingText = getSiblingText(el.data.coords, candidates.map(c => c.data));
    }
  }
  return bucketed.flat()
}