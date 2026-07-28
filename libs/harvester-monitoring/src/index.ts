import { solidityPackedKeccak256, verifyMessage, getBytes, type Signer } from "ethers";
import { sign } from "@thecointech/utilities/SignedMessages";
import type {
  HarvesterRegistrationRequest,
  HarvesterRunStartRequest,
  HarvesterRunCompletionRequest,
} from "./types";

export * from "./types";

//
// Registration
function getRegistrationBuffer(request: Omit<HarvesterRegistrationRequest, "signature">) {
  const hash = solidityPackedKeccak256(
    ["address", "string", "string", "string", "string", "uint256"],
    [
      request.user,
      request.installationId,
      request.platform ?? "",
      request.architecture ?? "",
      request.action,
      request.observedAt.toMillis(),
    ]
  );
  return getBytes(hash);
}

export async function buildHarvesterRegistrationRequest(
  user: Signer,
  request: Omit<HarvesterRegistrationRequest, "user" | "signature">
): Promise<HarvesterRegistrationRequest> {
  const r = { ...request, user: await user.getAddress() };
  const signature = await sign(getRegistrationBuffer(r), user);
  return { ...r, signature };
}

export function getHarvesterRegistrationSigner(request: HarvesterRegistrationRequest) {
  return verifyMessage(getRegistrationBuffer(request), request.signature);
}

//
// Run start
function getRunStartBuffer(request: Omit<HarvesterRunStartRequest, "signature">) {
  const hash = solidityPackedKeccak256(
    ["address", "string", "string", "string", "string", "string", "uint256", "uint256"],
    [
      request.user,
      request.installationId,
      request.platform ?? "",
      request.architecture ?? "",
      request.appVersion ?? "",
      request.trigger,
      request.startedAt.toMillis(),
      request.startedAtClient?.toMillis() ?? 0,
    ]
  );
  return getBytes(hash);
}

export async function buildHarvesterRunStartRequest(
  user: Signer,
  request: Omit<HarvesterRunStartRequest, "user" | "signature">
): Promise<HarvesterRunStartRequest> {
  const r = { ...request, user: await user.getAddress() };
  const signature = await sign(getRunStartBuffer(r), user);
  return { ...r, signature };
}

export function getHarvesterRunStartSigner(request: HarvesterRunStartRequest) {
  return verifyMessage(getRunStartBuffer(request), request.signature);
}

//
// Run completion
function getRunCompletionBuffer(request: Omit<HarvesterRunCompletionRequest, "signature">) {
  const hash = solidityPackedKeccak256(
    ["address", "string", "string", "string", "uint256", "uint256", "string", "string", "string"],
    [
      request.user,
      request.installationId,
      request.runId,
      request.outcome,
      request.finishedAt.toMillis(),
      request.finishedAtClient?.toMillis() ?? 0,
      (request.failureStages ?? []).join(","),
      request.failureCategory ?? "",
      request.terminalSource,
    ]
  );
  return getBytes(hash);
}

export async function buildHarvesterRunCompletionRequest(
  user: Signer,
  request: Omit<HarvesterRunCompletionRequest, "user" | "signature">
): Promise<HarvesterRunCompletionRequest> {
  const r = { ...request, user: await user.getAddress() };
  const signature = await sign(getRunCompletionBuffer(r), user);
  return { ...r, signature };
}

export function getHarvesterRunCompletionSigner(request: HarvesterRunCompletionRequest) {
  return verifyMessage(getRunCompletionBuffer(request), request.signature);
}
