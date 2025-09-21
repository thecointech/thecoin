import { useEffect, useState } from 'react'
import { Button, Checkbox, Dimmer, Header, Loader, Segment, SegmentGroup } from 'semantic-ui-react'
import styles from './index.module.less';

export const Advanced = () => {

  const [visible, setVisible] = useState<boolean>();
  const [logging, setLogging] = useState(false);
  const [dimmerMessage, setDimmerMessage] = useState<string | null>(null);

  const withDimmer = async <T,>(message: string, callback: () => Promise<T>): Promise<T> => {
    setDimmerMessage(message);
    try {
      return await callback();
    } finally {
      setDimmerMessage(null);
    }
  };

  useEffect(() => {
    withDimmer("Loading...", async () => {
      const [visibleResult, loggingResult] = await Promise.all([
        window.scraper.alwaysRunScraperVisible(),
        window.scraper.alwaysRunScraperLogging()
      ]);
      setVisible(visibleResult.value ?? false);
      setLogging(loggingResult.value ?? false);
    });
  }, [])

  const setAlwaysVisible = async (visible?: boolean) => {
    await withDimmer("Saving...", async () => {
      const r = await window.scraper.alwaysRunScraperVisible(visible)
      setVisible(r.value ?? false)
    });
  }

  const setAlwaysLogging = async (logging?: boolean) => {
    await withDimmer("Saving...", async () => {
      const r = await window.scraper.alwaysRunScraperLogging(logging)
      setLogging(r.value ?? false)
    });
  }


  const exportResults = async () => {
    const r = await window.scraper.exportResults();
    if (r.error) {
      alert("Error - please check logs:\n " + r.error);
    }
    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([r.value ?? 'no values'], { type: 'text/csv' }));
    a.download = 'results.csv';

    // Append anchor to body.
    document.body.appendChild(a);
    a.click();

    // Remove anchor from body
    document.body.removeChild(a);
    window.URL.revokeObjectURL(a.href);
  }

  // const exportConfig = async () => {
  //   const r = await window.scraper.exportConfig();
  //   if (r.error) {
  //     alert("Error - please check logs:\n " + r.error);
  //   }
  //   const a = window.document.createElement('a');
  //   a.href = window.URL.createObjectURL(new Blob([r.value ?? 'no values'], { type: 'text/csv' }));
  //   a.download = 'config.json';

  //   // Append anchor to body.
  //   document.body.appendChild(a);
  //   a.click();

  //   // Remove anchor from body
  //   document.body.removeChild(a);
  //   window.URL.revokeObjectURL(a.href);
  // }

  // const importConfig = async () => {
  //   // Create file input element
  //   const input = document.createElement('input');
  //   input.type = 'file';
  //   input.accept = '.json';

  //   // Handle file selection
  //   input.onchange = async (e) => {
  //     const file = (e.target as HTMLInputElement).files?.[0];
  //     if (!file) return;

  //     try {
  //       // Read and parse the JSON file
  //       const text = await file.text();
  //       const config = JSON.parse(text);

  //       // Validate that we can get a scraping config
  //       // getScrapingScript(config);
  //       // Set the process config
  //       const r = await window.scraper.importScraperScript(config);
  //       if (r.error) {
  //         alert("Error - please check logs:\n " + r.error);
  //       }
  //       else {
  //         alert("Config imported successfully!");
  //       }
  //     } catch (err) {
  //       console.error('Failed to import config:', err);
  //       alert('Failed to import configuration file. Please ensure it is a valid JSON file with scraping settings.');
  //     }
  //   };

  //   // Trigger file selection
  //   input.click();
  // }

  async function launchBrowser() {
    const r = await window.scraper.warmup("_blank");
    if (r.error) {
      alert("Error - please check logs:\n " + r.error);
    }
  }

  const openLogs = async () => {
    await window.scraper.openLogsFolder()
  }

  const paused = !!dimmerMessage;

  return (
    <SegmentGroup compact className={styles.container}>
      <Dimmer active={paused} inverted>
        <Loader>{dimmerMessage}</Loader>
      </Dimmer>
      <Segment>
        <Header size="small">Browser Controls</Header>
        <p>
        To see what the harvester is doing, you can force it to always run visible.<br />
        This is useful for debugging, but not recommended for normal use.
        </p>
        <Checkbox
          onClick={(_, {checked}) => setAlwaysVisible(checked)}
          checked={visible}
          disabled={paused}
          label="Force Always run visible" />
        <Button onClick={launchBrowser}>Launch Browser</Button>
      </Segment>
      <Segment>
        <Header size="small">Logging</Header>
        <p>
        By default, the harvester does not log banking API interactions.  Enabling verbose logging will log
        every step in the process.  This can log sensitive information, so use with caution.
        </p>
        <Checkbox
          onClick={(_, {checked}) => setAlwaysLogging(checked)}
          checked={logging}
          disabled={paused}
          label="Enable verbose logging" />
        <br />
        <a onClick={openLogs}>View Logs</a>

      </Segment>
      <Segment>
        <Header size="small">Import/Export Harvester data</Header>
        <p>
        Export a CSV file with all of this harvester's transactions.
        </p>
        <Button onClick={exportResults}>Export Results</Button>
        {/* <Button onClick={exportConfig}>Export Config</Button>
        <Button onClick={importConfig}>Import Script</Button> */}
      </Segment>
    </SegmentGroup>
  )
}
