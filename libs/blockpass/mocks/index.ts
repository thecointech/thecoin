import { useEffect } from 'react';
import { sleep } from '@thecointech/async/sleep';
import { log } from '@thecointech/logging';
import { GetUserVerificationApi } from '@thecointech/apis/broker';
import { openMockKycDialog, MockKycFields } from './dialog';

//
// In development, the Blockpass widget is replaced by a mock dialog.
// Completing it drives the mock webhook (UserVerificationApi) through
// the same status sequence the real service would produce; the client
// observes the results by polling the mock DetailsApi.
export function useBlockpass(address: string, _email: string|undefined, onClose: () => void) {

  useEffect(() => {
    const button = document.getElementById("blockpass-kyc-connect");
    if (!button) return;
    const click = button.onclick;
    button.onclick = (...args) => {
      //@ts-ignore
      if (click) click(...args);
      openMockKycDialog(
        (fields) => runMockFlow(address, fields, onClose),
        onClose
      );
    };
    return () => { button.onclick = click; }
  }, [])

  return "ready";
}

// This is run in the browser.  Ideally, in devlive, it would be provided to broker-service.
async function runMockFlow(address: string, _fields: MockKycFields, onClose: () => void) {
  const approved = _fields.outcome === "approved";
  const base = {
    clientId: "mocked",
    guid: "123",
    recordId: "mocked",
    refId: address,
  }
  const api = GetUserVerificationApi();

  log.trace('Mocking User Created')
  await api.updateStatus("signature", {
    ...base,
    event: "user.created",
    status: "incomplete",
  });

  await sleep(2000);
  log.trace('Mocking User Waiting')
  await api.updateStatus("signature", {
    ...base,
    event: "user.readyToReview",
    status: "waiting",
  });

  // If we are approved, write out _fields to a file to allow for testing
  if (approved) {
    // TODO: Write _fields to a file
    if (process.env.CONFIG_NAME === 'devlive') {
      const response = await fetch(`${process.env.URL_SERVICE_BROKER}/mock/blockpass/${encodeURIComponent(address)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(_fields),
      });
      if (!response.ok) throw new Error(`Cannot seed mock Blockpass data: ${response.status}`);
    }

  }

  // This is where the user theoretically closes their iframe
  onClose();

  await sleep(4000);
  log.trace(approved ? 'Mocking User Approved' : 'Mocking User Rejected')
  await api.updateStatus("signature", {
    ...base,
    event: approved ? "review.approved" : "review.rejected",
    status: approved ? "approved" : "rejected",
  });
}
