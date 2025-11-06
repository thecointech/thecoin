// import { jest } from "@jest/globals";
// import { describe, IsManualRun } from "@thecointech/jestutils"
// import { getTestData, hasTestingPages } from "../internal/getTestData";
// import { getElementForEvent } from "./elements";
// import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
// import { ElementNotFoundError } from "./errors";
// import { log } from "@thecointech/logging";
// import path from "node:path";
// import { OverrideData } from "../internal/overrides";
// import { TestData } from "@thecointech/scraper-testing";
// import { ElementSearchParams, FoundElement } from "./types";

// jest.setTimeout(20 * 60 * 1000);
// const MIN_ELEMENTS_IN_VALID_PAGE = 25;

// describe("It finds the same elements as before in archive", () => {
//   runTests();
// }, hasTestingPages);

// describe("It runs only the failing tests in archive", () => {
//   runTests(getLastFailing());
// }, IsManualRun)

// function runTests(includeFilter?: IncludeFilter) {

//   // Even if skipped above this function still runs to list the tests
//   // We don't want hundreds of skipped tests to show up in our results, so return early
//   if (!includeFilter && IsManualRun) {
//     return;
//   }
//   const testData = getTestData("*", "elm.json", "archive");
//   const overrides = initOverrides();
//   const currentlyFailing = new Set<string>();
//   const results = [];
//   const filteredTests = testData.filter(test => !shouldSkip(test, includeFilter));
//   const allElements = filteredTests
//     .flatMap(test => test.elements().map(element => {
//       const name = element.match(/(.+)-elm.json/)?.[1];
//       return { test, element, name };
//     }))
//   const [filteredElements, skippedElements] = allElements
//     .reduce(([filtered, skipped], { test, element, name }) => {
//       const sch = test.sch(name);
//       if (sch?.search.event.estimated) {
//         filtered.push({ testKey: test.key, test, element, name });
//       }
//       else {
//         skipped.push(`${test.key} - ${name}`);
//       }
//       return [filtered, skipped];
//     }, [[], []]);

//   console.log(`Found ${filteredElements.length} elements to test, skipping ${skippedElements.length}`);
//   // Let us know how many elements we skipped
//   it.skip.each(skippedElements)("non-vqa element: %s", (name) => {});

//   const counter = makeCounter(filteredElements);
//   it.each(filteredElements)("Finds the correct element: $testKey - $name", async ({ testKey, test, name }) => {
//     counter(results);
//     const page = await test.page();
//     const sch = test.sch(name);
//     const elm = test.elm(name);
//     // const now = IsManualRun ? undefined : Date.now();
//     // const folder = path.join(process.env.PRIVATE_TESTING_PAGES, "debugging", name);
//     // if (!existsSync(folder)) {
//     //   mkdirSync(folder, { recursive: true });
//     // }
//     const onFound = async (candidate: FoundElement, params: ElementSearchParams, candidates: FoundElement[]) => {
//       // TODO: Write out debugging info for candidates if they do not match.
//     }
//     try {
//       const found = await getElementForEvent({
//         ...sch.search,
//         page,
//         timeout: 500
//       }, onFound);
//       let writeOverride = true;
//       const expText = elm.text.replace(/\s+/g, " ").trim();

//       if (found.data.text !== expText || found.data.selector !== elm.selector) {
//         if (writeOverride) {
//           const testOverrides = overrides[test.key] = overrides[test.key] ?? {};
//           const elementOverride = testOverrides[name] = testOverrides[name] ?? {};
//           if (found.data.text !== elm.text) {
//             elementOverride.text = found.data.text;
//             elementOverride.coords = found.data.coords;
//           }
//           if (found.data.selector !== elm.selector) {
//             elementOverride.selector = found.data.selector;
//             elementOverride.coords = found.data.coords;
//           }
//         }
//         results.push({
//           key: test.key,
//           found,
//           expected: elm,
//         })
//       }

//       // await writeDebugging(test, found, name, now, folder);

//       expect(found.data.text).toEqual(expText);
//       expect(found.data.selector).toEqual(elm.selector)
//     }
//     catch (e) {
//       if (e instanceof ElementNotFoundError) {
//         // Sometimes, mhtml is a wee bit bung
//         const allElements = await page.$$("*")
//         if (allElements.length < MIN_ELEMENTS_IN_VALID_PAGE) {
//           log.error(`Element not found, but page is empty, check mhtml on ${test.key}`)
//           overrides.skip[test.key] = {
//             reason: "Page is empty",
//           };
//           return;
//         }
//       }
//       currentlyFailing.add(test.key);
//       throw e;
//     }
//   })

//   afterAll(() => {
//     const overridePath = path.join(process.env.PRIVATE_TESTING_PAGES, "archive", `overrides-${Date.now()}.json`);
//     writeFileSync(overridePath, JSON.stringify(overrides, null, 2));
//     writeLastFailing(currentlyFailing);
//     console.table(results.map(r => ({ key: r.key, found: r.found.data.selector, expected: r.expected.selector })));
//   })
// }

// // Simple helper functions

// type IncludeFilter = {
//   exclude: string[];
//   include: string[];
// }
// function getLastFailing(): IncludeFilter | null {
//   const file = lastFailingFile();
//   if (!file) return null;
//   if (existsSync(file)) {
//     return JSON.parse(readFileSync(file, "utf-8"));
//   }
//   return null;
// }

// function writeLastFailing(failing: Set<string>) {
//   const file = lastFailingFile();
//   if (!file) return;
//   writeFileSync(file, JSON.stringify({
//     include: Array.from(failing),
//     exclude: [],
//   }, null, 2));
// }

// function shouldSkip(test: TestData, includeFilter?: IncludeFilter) {
//   // If missing data, just skip
//   if (!test.hasSnapshot() || test.searches().length == 0) {
//     return true;
//   }
//   if (includeFilter) {
//     return (
//       !includeFilter.include.includes(test.key) ||
//       includeFilter.exclude.includes(test.key)
//     );
//   }
//   return false
// }

// function initOverrides(): OverrideData {
//   return {
//     skip: {},
//     overrides: {},
//   }
// }

// function lastFailingFile() {
//   return process.env.PRIVATE_TESTING_PAGES
//     ? path.join(process.env.PRIVATE_TESTING_PAGES, "archive", `failing-elm.json`)
//     : null;
// }

// function makeCounter(filtered: { test: TestData, element: string }[]) {
//   let count = 0;
//   return (results: any[]) => {
//     count++;
//     if (count % 10 == 0) {
//       console.log(`Running test ${count} (failed ${results.length}) of ${filtered.length}`);
//     }
//     return count;
//   }
// }


// async function writeDebugging(test: TestData, found: FoundElement, name: string, now?: number, folder?: string) {

//   if (!now || !folder) return;

//   try {
//     const elm = test.elm(name);
//     const page = await test.page();
//     // const now = Date.now();
//     await page.screenshot({
//       path: path.join(folder, `${now}-1-blank.png`),
//     });

//     await page.evaluate(createOverlay);

//     // const createBorderBox = (element: HTMLElement, color: string) => {
//     //   const box = document.createElement("div");
//     //   box.style.position = "absolute";
//     //   box.style.left = element.offsetLeft + "px";
//     //   box.style.top = element.offsetTop + "px";
//     //   box.style.width = element.offsetWidth + "px";
//     //   box.style.height = element.offsetHeight + "px";
//     //   box.style.border = `2px solid ${color}`;
//     //   document.body.appendChild(box);
//     // }

//     // Wrap the found element in a red border so we can see it.
//     await found.element.evaluateHandle(element => {
//       globalThis.setBox(element, "red");
//     });
//     await page.screenshot({
//       path: path.join(folder, `${now}-2-found.png`),
//     });

//     await page.$eval(elm.selector, (el) => {
//       globalThis.setBox(el, "blue");
//     });
//     await page.screenshot({
//       path: path.join(folder, `${now}-3-original.png`),
//     });
//   }
//   catch (e) {
//     console.error(e);
//   }
// }

// function createOverlay() {
//   /**
//    * This object encapsulates the elements and actions of the overlay.
//    */
//   class Overlay {
//     top: HTMLDivElement;
//     bottom: HTMLDivElement;
//     left: HTMLDivElement;
//     right: HTMLDivElement;
//     outer: HTMLDivElement;

//     constructor() {
//       // outer parent
//       this.outer = document.createElement("div");
//       this.outer.style.position = "absolute"
//       this.outer.style.top = "0"
//       this.outer.style.left = "0"
//       this.outer.style.zIndex = "65000";
//       document.body.appendChild(this.outer);

//       const createAndAppend = (css: string, val: number) => {
//         const el = document.createElement('div');
//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         //@ts-ignore
//         el.style[css] = `${val}px`;
//         el.style.position = "absolute";
//         el.style.background = "red";
//         this.outer.appendChild(el);
//         return el;
//       }

//       // red lines (boxes)
//       this.top = createAndAppend('height', 2);
//       this.bottom = createAndAppend('height', 2);
//       this.left = createAndAppend('width', 2);
//       this.right = createAndAppend('width', 2);
//     }
//     /**
//      * Public interface
//      */

//     show() {
//       this.outer.style.display = "normal";
//       // this.outer.show();
//     }

//     hide() {
//       this.outer.style.display = "none";
//     }

//     render(width: number, height: number, left: number, top: number) {

//       this.top.style.top = `${top}px`;
//       this.top.style.left = `${left}px`;
//       this.top.style.width = `${width}px`;

//       this.bottom.style.top = `${top + height - 1}px`;
//       this.bottom.style.left = `${left}px`;
//       this.bottom.style.width = `${width}px`;

//       this.left.style.top = `${top}px`;
//       this.left.style.left = `${left}px`;
//       this.left.style.height = `${height}px`;

//       this.right.style.top = `${top}px`;
//       this.right.style.left = `${left + width - 1}px`;
//       this.right.style.height = `${height}px`;

//       this.show();
//     }

//     setColor(color: string) {
//       this.top.style.background = color;
//       this.bottom.style.background = color;
//       this.left.style.background = color;
//       this.right.style.background = color;
//     }
//   }

//   globalThis.__overlay__ = new Overlay();
//   globalThis.setBox = (el: HTMLElement, color: string = "red") => {
//     const rect = el.getBoundingClientRect()
//     globalThis.__overlay__.render(rect.width, rect.height, rect.left + window.scrollX, rect.top + window.scrollY);
//     globalThis.__overlay__.setColor(color);
//   }
// }
