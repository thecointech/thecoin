import path from "node:path";
import { existsSync, rmSync, cpSync, readdirSync, mkdirSync } from "node:fs";
import { log } from "@thecointech/logging";

export function updateRecordLatest(recordFolder: string, target: string) {

  const { source, dest } = getSourceDest(recordFolder, target);

  const sourceSections = readdirSync(source);
  for (const section of sourceSections) {
    copySection(section, source, dest);
  }
  log.info("Updated latest record folder for: " + target);
}

export function copySection(section: string, source: string, dest: string) {
  const sourceSection = path.join(source, section)
  const destSection = path.join(dest, section);
  switch (section) {
    case "events.log":
    case "events.json":
      // Do not copy events
      break;
    case "CookieBanner": {
      // Only copy cookie banner if "accept" element is present
      const sourceElements = readdirSync(sourceSection);
      if (sourceElements.find(e => e.includes("accept-elm"))) {
        copyEntireFolder(sourceSection, destSection);
      }
    }
    break;
  case "SendETransfer":
    // Ensure we keep the "session-continue" if it is present
    copyElementsWithFilter(sourceSection, destSection, "session-continue-elm");
    break;
  default:
    // Copy the entire section
    copyEntireFolder(sourceSection, destSection);
    break;
  }
}

export function getSourceDest(recordFolder: string, target: string) {
  const latestFolder = path.resolve(recordFolder, "..", "..", "record-latest");

  if (!existsSync(latestFolder)) {
    throw new Error("Latest folder should exist at: " + latestFolder)
  }

  // Ensure target folder exists
  mkdirSync(path.join(latestFolder, target), { recursive: true })

  // for each folder in record folder, copy to latest folder
  const source = path.join(recordFolder, target);
  const dest = path.join(latestFolder, target);
  return { source, dest };
}

export function copyEntireFolder(sourceSection: string, destSection: string) {
  try {
    rmSync(destSection, { recursive: true });
  }
  catch (e) {}
  cpSync(sourceSection, destSection, { recursive: true });
}

export function copyElementsWithFilter(sourceSection: string, destSection: string, preservedElement: string) {
  const sourceElements = readdirSync(sourceSection);
  const preservedElementSrc = sourceElements.find(e => e.includes(preservedElement));
  // If the source contains the preserved element,
  // then we can simply copy over the entire folder.
  if (preservedElementSrc) {
    copyEntireFolder(sourceSection, destSection);
    return;
  }

  // we need to preserve this element & it's page
  const destElements = readdirSync(destSection);
  const preservedElementDest = destElements.find(e => e.includes(preservedElement));
  // If the destination doesn't contain the preserved element,
  // we can simply copy over the entire folder
  if (!preservedElementDest) {
    copyEntireFolder(sourceSection, destSection);
    return;
  }

  // Otherwise, copy everything except for the preseved page/elements
  const page = preservedElementDest.split("-")[0];
  // Remove everything that is _not_ preserved
  for (const destElement of readdirSync(destSection)) {
    if (!destElement.startsWith(page)) {
      rmSync(path.join(destSection, destElement), { recursive: true });
    }
  }
  // Copy everything over, except for preserved page elements
  for (const element of sourceElements) {
    if (!element.startsWith(page)) {
      cpSync(path.join(sourceSection, element), path.join(destSection, element));
    }
  }
}
