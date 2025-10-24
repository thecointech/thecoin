import { Button } from "semantic-ui-react";
import { DimmerCallback } from "./types";

export const ExportConfig = ({withDimmer}: {withDimmer: DimmerCallback}) => {


  const exportConfig = async () => {
    withDimmer("Exporting...", async () => {
      const r = await window.scraper.exportConfig();
      if (r.error) {
        alert("Error - please check logs:\n " + r.error);
        return;
      }
      const a = window.document.createElement('a');
      a.href = window.URL.createObjectURL(new Blob([r.value ?? 'no values'], { type: 'application/json' }));
      a.download = 'config.json';

      // Append anchor to body.
      document.body.appendChild(a);
      a.click();

      // Remove anchor from body
      document.body.removeChild(a);
      window.URL.revokeObjectURL(a.href);
    });
  }

  const importConfig = async () => {
    withDimmer("Importing...", async () => {
      // Create file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      // Handle file selection
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          // Read and parse the JSON file
          const text = await file.text();
          const config = JSON.parse(text);

          // Validate that we can get a scraping config
          // getScrapingScript(config);
          // Set the process config
          const r = await window.scraper.importScraperScript(config);
          if (r.error) {
            alert("Error - please check logs:\n " + r.error);
          }
          else {
            alert("Config imported successfully!");
          }
        } catch (err) {
          console.error('Failed to import config:', err);
          alert('Failed to import configuration file. Please ensure it is a valid JSON file with scraping settings.');
        }
      };

      // Trigger file selection
      input.click();
    })
  }


  return (
    <>
      <p>
        Export the scrapers configuration.
        This includes your banks login details, so be very careful with this file.
      </p>
      <div>
        <Button onClick={exportConfig}>Export Config</Button>
      </div>
      <p>
        Import the scrapers bank API script.  This can be the same file you exported, but it does
        not modify the Harvester configuration, even if that info is included.
      </p>
      <div>
        <Button onClick={importConfig}>Import Script</Button>
      </div>
    </>
  )
}
