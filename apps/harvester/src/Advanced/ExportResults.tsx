import { Button } from "semantic-ui-react";

export const ExportResults = () => {
  const exportResults = async () => {
    const r = await window.scraper.exportResults();
    if (r.error) {
      alert("Error - please check logs:\n " + r.error);
      return;
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

  return (
    <>
      <p>
        Export a CSV file with all of this harvester's transactions.
      </p>
      <Button onClick={exportResults}>Export Results</Button>
    </>
  )
}
