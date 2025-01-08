import type { ElementHandle, Frame, Page } from 'puppeteer';
import type { Coords, ElementData, ElementDataMin } from './types';
import { log } from '@thecointech/logging';
import { sleep } from '@thecointech/async';
import { scoreElement } from './elements.score';

export type FoundElement = {
  element: ElementHandle<Element>,
  score: number,
  data: ElementData
}

declare global {
  interface Window {
    getElementData: (el: HTMLElement, skipSibling?: boolean) => ElementData;
  }
}

export async function getElementForEvent(page: Page, event: ElementDataMin, timeout=30000, minScore=70) {

  const startTick = Date.now();

  const title = await page.title();
  log.info(`Searching \"${title}\" for: ${event.tagName} - ${event.text} - ${event.siblingText} - ${event.selector}`);

  while (Date.now() < startTick + timeout) {

    const candidates = await fetchAllCandidates(page, event);
    const candidate = await getBestCandidate(candidates, event, minScore);

    if (candidate) {
      return candidate;
    }

    // Continue waiting
    await sleep(500);
  }

  // // Not found, what candidate failed?
  // log.debug(' ** Failed Candidate ** ')
  // dbgPrintCandidate(candidate, event);

  // Not found, throw
  throw new Error(`Element ${event.tagName} not found with text: "${event.text}" and siblings: "${event.siblingText?.join(', ')}"`);
}

async function fetchAllCandidates(page: Page, event: ElementDataMin) {
  const candidates: FoundElement[] = [];
  const frames = page.frames();
  const nFrames = frames.length;
  let nErrors = 0;
  log.info(`Searching ${nFrames} frames`);
  for (const frame of frames) {
    try {
      // Get all elements in frame
      const frameCandidates = await getCandidates(frame, event);
      candidates.push(...frameCandidates);
    }
    catch (e) {
      // Something went wrong, log the error and throw
      log.error(e, `Error searching frame`);
      // DO NOT THROW.  We don't know what went wrong and there is a good
      // chance it's some frame-specific issue and we could just continue
      nErrors++;
    }
  }
  if (nErrors == nFrames) {
    // If all frames errored, this is probably non-recoverable
    throw new Error("Could not search any frames");
  }
  log.info(`Got ${candidates.length} candidates`);
  return candidates;
}

let lastDbgLogMessage: string;
function maybeLogMessage(message: string) {
  if (lastDbgLogMessage != message) {
    log.debug(message);
    lastDbgLogMessage = message;
  }
}

async function getBestCandidate(candidates: FoundElement[], event: ElementDataMin, minScore: number) {
  // Sort by score to see if any element is close enough
  const sorted = candidates.sort((a, b) => b.score - a.score);
  const candidate = sorted[0];

  // Extra debugging
  if (process.env.HARVESTER_VERBOSE_SCRAPER) {
    dbgPrintCandidate(candidate, event);
  }

  // Max score is 125.  70 is chosen via trial/error, but
  // works for selector + location + tagName, or
  // location + siblings + tagName + text + font
  if (candidate?.score >= minScore) {
    maybeLogMessage(`Found candidate with score: ${candidate?.score} (${candidate?.data?.selector}), second best: ${sorted[1]?.score}`);
    // Do we need to worry about multiple candidates?
    if (sorted[1]?.score / candidate.score > 0.9) {
      log.warn(` ** Second best candidate has  ${sorted[1]?.score} score`);
      dbgPrintCandidate(sorted[1], event);
      log.info(" ** best candidate ** ");
      dbgPrintCandidate(candidate, event);
    }
    return candidate;
  }
  maybeLogMessage(`Candidate with score: ${candidate?.score} (${candidate?.data?.selector}) did not meet score >= ${minScore}`);
  return null;
}

async function getCandidates(frame: Frame, event: ElementDataMin, timeout=300) {
  // We are getting the occasional issue where getElementProps
  // is undefined.  This could potentially be a race condition
  // if this fn evaluates before evaluateOnNewDocument (?)

  let messageToLogOnTimeout = "Getting candidates for frame";
  // Instead of spamming, do intermittent logging so we can see if we truly have locked up
  const intervalLogger = setInterval(() => {
    log.trace(messageToLogOnTimeout);
  }, 1500);

  try {
    // This function may hang on pages with many frames
    // It should be near-instant, so after 1 second we give up
    const hasHooks = await Promise.race([
      new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), timeout)),
      frame.evaluate(() => !!window.getElementData)
    ])

    // const hasHooks = await frame.evaluate(() => !!window.getElementData)
    if (!hasHooks) {
      if (hasHooks === undefined) {
        log.warn("Frame timed out when testing for getElementData hook");
      }
      // This is spamming the logs searching frames that are obviously unnecessary.
      // Leave it out for now.
      // log.warn("getElementData not yet hooked: skipping");
      return [];
    };

    messageToLogOnTimeout = "Getting elements for frame";
    const elements = await getAllElements(frame);
    messageToLogOnTimeout = "Filling out siblings for frame with " + elements.length + " elements";
    const withSiblings = fillOutSiblingText(elements);
    messageToLogOnTimeout = "Scoring frame with " + withSiblings.length + " elements";

    const candidates: FoundElement[] = [];
    for (let i = 0; i < withSiblings.length; i++) {
      messageToLogOnTimeout = `Scoring element: ${i} of ${withSiblings.length}`;
      const el = withSiblings[i];
      const score = await scoreElement(el.data, event);
      if (score > 0) {
        candidates.push({
          ...el,
          score
        })
      }
    }
    return candidates;
  }
  finally {
    clearInterval(intervalLogger);
  }
}

let lastDbgPrintCandidateSelector: string;
async function dbgPrintCandidate(candidate: FoundElement, event: ElementDataMin) {
  if (lastDbgPrintCandidateSelector == candidate.data.selector) {
    // Do not spam with lotsa logging
    return;
  }
  lastDbgPrintCandidateSelector = candidate.data.selector;
  log.debug(`Tag: ${event.tagName} - ${candidate?.data?.tagName}`);
  log.debug(`Selector: ${event.selector} - ${candidate?.data?.selector}`);
  log.debug(`Text: ${event.text} - ${candidate?.data?.text}`);
  log.debug(`Label: ${event.label} - ${candidate?.data?.label}`);
  log.debug(`Coords: ${JSON.stringify(event.coords)} - ${JSON.stringify(candidate?.data?.coords)}`);
  log.debug(`Siblings: ${JSON.stringify(event.siblingText)} - ${JSON.stringify(candidate?.data?.siblingText)}`);
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
  const styles = elem.computedStyleMap();
  //@ts-ignore `value` is not part of the spec, but it appears to always be there in px
  const paddingTop = styles.get("padding-top")?.value || 0;
  //@ts-ignore
  const paddingBottom = styles.get("padding-bottom")?.value || 0;
  //@ts-ignore
  const paddingLeft = styles.get("padding-left")?.value || 0;
  //@ts-ignore
  const paddingRight = styles.get("padding-right")?.value || 0;
  // We want the height/width of the content, so ignore padding
  const height = box.height - (paddingTop + paddingBottom);
  const width = box.width - (paddingRight + paddingLeft);
  return {
    top: box.top + window.scrollY + paddingTop,
    left: box.left + window.scrollX + paddingLeft,
    centerY: box.top + window.scrollY + paddingTop + (height / 2),
    height,
    width,
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
    // We allow for slight offsets of generally 2/3 pixels
    return Math.abs(rowcoords.centerY - elcoords.centerY) < 2
  })
  .map(c => c.nodeValue) as string[];

type SearchElement = {
  element: ElementHandle<HTMLElement>,
  data: ElementData
}

export const getAllElements = async (frame: Page|Frame) => {
  const allElements = await frame.$$("*")
  const allData = await frame.evaluate(
    (...els) => els.map(el =>
      (
        el instanceof HTMLElement &&
        // Most irrelevant elements (eg header, script) are skipped
        // due the `instanceof HTMLElement` check, but HTLM & body are not
        !["HTML", "BODY"].includes(el.tagName) &&
        //@ts-ignore
        el.checkVisibility({
          checkOpacity: true,  // Check CSS opacity property too
          checkVisibilityCSS: true // Check CSS visibility property too
        })
      ) ? getElementProps?.(el)
        : null
    ),
    ...allElements
  )

  return allData
    .reduce((r, data, i) => {
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
const getBucketIdx = (coords: Coords) => Math.floor(coords.centerY / BUCKET_PIXELS);

// fill out sibling text for each element in the tree.
// This is an O(n^2) operation, so we use a bucketing approach
const fillOutSiblingText = (allElements: SearchElement[]) => {
  // Implement bucketting to optimize the search time for sibling text
  const bucketed: SearchElement[][] = [];
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];
    const idx = getBucketIdx(el.data.coords);
    if (!bucketed[idx]) bucketed[idx] = [el]
    else bucketed[idx].push(el)
  }

  // Now fill out the siblings
  for (let bidx = 0; bidx < bucketed.length; bidx++) {
    const bucket = bucketed[bidx];
    if (!bucket) continue;

    for (let i = 0; i < bucket.length; i++) {
      const el = bucket[i];
      const elcoords = el.data.coords;
      const neighbours = (elcoords.centerY % BUCKET_PIXELS)  < (BUCKET_PIXELS / 2)
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
