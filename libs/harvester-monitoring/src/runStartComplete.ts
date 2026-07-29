import { solidityPackedKeccak256, verifyMessage, getBytes, type Signer } from "ethers";
import { sign } from "@thecointech/utilities/SignedMessages";
import type {
  HarvesterRunStart,
  HarvesterRunStartSigned,
  HarvesterRunStartDTO,
  HarvesterRunComplete,
  HarvesterRunCompleteDTO,
  HarvesterRunCompleteSigned,
} from "./types";


//
// Run start
function getRunStartBuffer(request: HarvesterRunStartDTO) {
  const hash = solidityPackedKeccak256(
    ["string", "string", "string", "string", "string", "uint256", "uint256"],
    [
      request.installationId,
      request.platform ?? "",
      request.architecture ?? "",
      request.appVersion ?? "",
      request.trigger,
      request.startedAt,
      request.startedAtClient ?? 0,
    ]
  );
  return getBytes(hash);
}

export async function signHarvesterRunStart(
  user: Signer,
  notify: HarvesterRunStart
): Promise<HarvesterRunStartSigned> {
  const dto = {
    ...notify,
    startedAt: notify.startedAt.toMillis(),
    startedAtClient: notify.startedAtClient?.toMillis(),
  }
  const signature = await sign(getRunStartBuffer(dto), user);
  return { ...dto, user: await user.getAddress(), signature };
}

export function getHarvesterRunStartSigner(request: HarvesterRunStartSigned) {
  return verifyMessage(getRunStartBuffer(request), request.signature);
}

//
// Run completion
function getRunCompletionBuffer(request: Omit<HarvesterRunCompleteDTO, "signature">) {
  const hash = solidityPackedKeccak256(
    ["string", "string", "string", "uint256", "uint256", "string", "string", "string"],
    [
      request.installationId,
      request.runId,
      request.outcome,
      request.finishedAt,
      request.finishedAtClient ?? 0,
      (request.failureStages ?? []).join(","),
      request.failureCategory ?? "",
      request.terminalSource,
    ]
  );
  return getBytes(hash);
}

export async function signHarvesterRunComplete(
  user: Signer,
  request: HarvesterRunComplete
): Promise<HarvesterRunCompleteSigned> {
  const dto = {
    ...request,
    finishedAt: request.finishedAt.toMillis(),
    finishedAtClient: request.finishedAtClient?.toMillis(),
  }
  const signature = await sign(getRunCompletionBuffer(dto), user);
  return { ...dto, user: await user.getAddress(), signature };
}

export function getHarvesterRunCompletionSigner(request: HarvesterRunCompleteSigned) {
  return verifyMessage(getRunCompletionBuffer(request), request.signature);
}
