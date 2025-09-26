import { useEffect, useState } from "react";
import { Checkbox } from "semantic-ui-react";
import { DimmerCallback } from "./types";


export const LoggingOptions = ({ withDimmer, paused }: { withDimmer: DimmerCallback, paused: boolean }) => {

  const [logging, setLogging] = useState(false);

    useEffect(() => {
      withDimmer("Loading...", async () => {
        const r = await window.scraper.alwaysRunScraperLogging()
        setLogging(r.value ?? false);
      });
    }, [])

  const setAlwaysLogging = async (logging?: boolean) => {
    await withDimmer("Saving...", async () => {
      const r = await window.scraper.alwaysRunScraperLogging(logging)
      setLogging(r.value ?? false)
    });
  }

  const openLogs = async () => {
    await window.scraper.openLogsFolder()
  }

  return (
    <>
      <p>
        By default, the harvester does not log banking API interactions.  Enabling verbose logging will log
        every step in the process.  This can log sensitive information, so use with caution.
      </p>
      <Checkbox
        onClick={(_, { checked }) => setAlwaysLogging(checked)}
        checked={logging}
        disabled={paused}
        label="Enable verbose logging" />
      <div style={{ marginTop: "0.75em" }}>
        <a onClick={openLogs}>View Logs</a>
      </div>
    </>
  )
}
