import { sleep } from '@thecointech/async';
import { useEffect } from 'react';
import { log } from '@thecointech/logging'
import { StatusType, GetUserVerificationApi } from '@thecointech/apis/broker';
// For reasons I don't understand, EventType will not import from apis/broker (in Storybook)
import { EventType } from '@thecointech/broker-cad';

//
// In DevLive, we just exercise our code (so ignore blockpass itself)
// To do this, we start a service that calls our broker-service with updates
export function useBlockpass(address: string, _email: string|undefined, onClose: () => void) {

  useEffect(() => {
    hookButton(address, onClose);
  }, [])
  return "ready";
}

async function hookButton(address: string, onClose: () => void) {
  await sleep(500);
  // Get the button
  const button = document.getElementById("blockpass-kyc-connect");
  if (!button) return;
  const click = button.onclick;
  button.onclick = (...args) => {
    //@ts-ignore
    if (click) click(...args);
    doIt(address, onClose);
  }
}

async function doIt(address: string, onClose: () => void) {
  const base = {
    clientId: "mocked",
    guid: "123",
    recordId: "mocked",
    refId: address,
  }
  const api = GetUserVerificationApi();

  await sleep(10000);
  log.trace('Mocking User Created')
  // First trigger should set status to
  await api.updateStatus("signature", {
    ...base,
    event: EventType.UserCreated,
    status: StatusType.Incomplete,
  });

  await sleep(10000);
  // Next, put client into waiting state
  log.trace('Mocking User Waiting')
  await api.updateStatus("signature", {
    ...base,
    event: EventType.UserReadyToReview,
    status: StatusType.Waiting,
  });

  // This is where the user theoretically closes their iframe
  onClose();

  await sleep(10000);
  // Next, put client into waiting state
  log.trace('Mocking User Approved')
  await api.updateStatus("signature", {
    ...base,
    event: EventType.ReviewApproved,
    status: StatusType.Approved,
  });
}
