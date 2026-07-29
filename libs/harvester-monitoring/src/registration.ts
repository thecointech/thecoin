import { solidityPackedKeccak256, verifyMessage, getBytes, type Signer } from "ethers";
import { sign } from "@thecointech/utilities/SignedMessages";
import type {
  HarvesterRegistrationRequest,
  HarvesterRegistrationRequestSigned,
  HarvesterRegistrationRequestDTO,
} from "./types";


//
// Registration
function getRegistrationBuffer(request: HarvesterRegistrationRequestDTO) {
  const hash = solidityPackedKeccak256(
    ["string", "string", "string", "string", "uint256"],
    [
      request.installationId,
      request.platform ?? "",
      request.architecture ?? "",
      request.action,
      request.observedAt,
    ]
  );
  return getBytes(hash);
}

export async function signHarvesterRegistrationRequest(
  user: Signer, request: HarvesterRegistrationRequest
): Promise<HarvesterRegistrationRequestSigned> {
  const address = await user.getAddress();
  const dto = {
    ...request,
    observedAt: request.observedAt.toMillis(),
  }
  const signature = await sign(getRegistrationBuffer(dto), user);
  return {
    ...dto,
    user: address,
    signature,
  };
}

export function getHarvesterRegistrationSigner(request: HarvesterRegistrationRequestSigned) {
  return verifyMessage(getRegistrationBuffer(request), request.signature);
}
