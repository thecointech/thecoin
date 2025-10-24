import { Button, Checkbox } from "semantic-ui-react";
import { DimmerCallback } from "./types";
import { useEffect, useState } from "react";

export const BrowserControls = ({ withDimmer, paused }: { withDimmer: DimmerCallback, paused: boolean }) => {

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    withDimmer("Loading...", async () => {
      const r = await window.scraper.alwaysRunScraperVisible();
      if (r.error) {
        alert("Error - please check logs:\n " + r.error);
        return;
      }
      setVisible(r.value ?? false);
    });
  }, [])

  const setAlwaysVisible = async (visible?: boolean) => {
    await withDimmer("Saving...", async () => {
      const r = await window.scraper.alwaysRunScraperVisible(visible)
      if (r.error) {
        alert("Error - please check logs:\n " + r.error);
        return;
      }
      setVisible(r.value ?? false)
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
        To see what the harvester is doing, you can force it to always run visible.<br />
        This is useful for debugging, but not recommended for normal use.
      </p>
      <Checkbox
        onClick={(_, { checked }) => setAlwaysVisible(checked)}
        checked={visible}
        disabled={paused}
        label="Force Always run visible" />
      <div style={{ marginTop: "0.75em" }}>
        <Button onClick={launchBrowser}>Launch Browser</Button>
      </div>
    </>
  )

}
