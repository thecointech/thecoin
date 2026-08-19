import { Button, Dropdown } from "semantic-ui-react";
import { DimmerCallback } from "./types";
import { useEffect, useState } from "react";
import type { ScraperVisibility } from '@thecointech/scraper/puppeteer-init/visibility';

const modeOptions = [
  {
    key: 'headless',
    value: 'headless',
    text: 'Hidden (headless)',
    description: 'Fastest, but some banks detect and block it',
  },
  {
    key: 'offscreen',
    value: 'offscreen',
    text: 'Off-screen',
    description: 'Full browser parked off-screen: slower, use this if headless fails',
  },
  {
    key: 'visible',
    value: 'visible',
    text: 'Visible',
    description: 'Shows the browser window: useful for debugging, but easily disturbed by user interaction',
  },
];

export const BrowserControls = ({ withDimmer, paused }: { withDimmer: DimmerCallback, paused: boolean }) => {

  const [mode, setModeState] = useState<ScraperVisibility>('headless');

  useEffect(() => {
    withDimmer("Loading...", async () => {
      const r = await window.scraper.scraperVisibilityMode();
      if (r.error) {
        alert("Error - please check logs:\n " + r.error);
        return;
      }
      setModeState(r.value ?? 'headless');
    });
  }, [])

  const setMode = async (mode?: ScraperVisibility) => {
    await withDimmer("Saving...", async () => {
      const r = await window.scraper.scraperVisibilityMode(mode)
      if (r.error) {
        alert("Error - please check logs:\n " + r.error);
        return;
      }
      setModeState(r.value ?? 'headless')
    });
  }

  async function launchBrowser() {
    const r = await window.scraper.warmup("_blank");
    if (r.error) {
      alert("Error - please check logs:\n " + r.error);
    }
  }

  return (
    <>
      <p>
        Controls how the harvester runs its browser.<br />
        "Off-screen" looks like a regular browser to banks without showing a window.
        Only change this if you are having trouble connecting.
      </p>
      <Dropdown
        selection
        onChange={(_, { value }) => setMode(value as ScraperVisibility)}
        value={mode}
        disabled={paused}
        options={modeOptions} />
      <div style={{ marginTop: "0.75em" }}>
        <Button onClick={launchBrowser}>Launch Browser</Button>
      </div>
    </>
  )

}
