import { AbiCoder, keccak256, verifyMessage, getBytes, type Signer } from "ethers";
import { sign } from "@thecointech/utilities/SignedMessages";
import type {
  HarvesterRunStart,
  HarvesterRunStartSigned,
  HarvesterRunStartDTO,
  HarvesterRunComplete,
  HarvesterRunCompleteDTO,
  HarvesterRunCompleteSigned,
} from "./types";

const abiCoder = AbiCoder.defaultAbiCoder();

//
// Run start
//
// Standard (non-packed) ABI encoding is used here (see registration.ts for
// why): packed encoding of adjacent dynamic strings has no field boundaries,
// so different field splits can hash identically.
function getRunStartBuffer(request: HarvesterRunStartDTO) {
  const encoded = abiCoder.encode(
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
  return getBytes(keccak256(encoded));
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
//
// failureStages is encoded as a string[] rather than comma-joined: joining
// discards structure (["a,b"] and ["a", "b"] would hash identically), and
// standard ABI encoding of a dynamic array already preserves each element's
// boundaries unambiguously.
function getRunCompletionBuffer(request: Omit<HarvesterRunCompleteDTO, "signature">) {
  const encoded = abiCoder.encode(
    ["string", "string", "string", "uint256", "uint256", "string[]", "string", "string"],
    [
      request.installationId,
      request.runId,
      request.outcome,
      request.finishedAt,
      request.finishedAtClient ?? 0,
      request.failureStages ?? [],
      request.failureCategory ?? "",
      request.terminalSource,
    ]
  );
  return getBytes(keccak256(encoded));
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
