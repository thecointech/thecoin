import { AbiCoder, keccak256, verifyMessage, getBytes, type Signer } from "ethers";
import { sign } from "@thecointech/utilities/SignedMessages";
import type {
  HarvesterRegistrationRequest,
  HarvesterRegistrationRequestSigned,
  HarvesterRegistrationRequestDTO,
} from "./types";

const abiCoder = AbiCoder.defaultAbiCoder();

//
// Registration
//
// Uses standard (non-packed) ABI encoding rather than solidityPacked*: packed
// encoding concatenates dynamic strings with no length prefix or delimiter,
// so adjacent string fields can collide across different field splits (e.g.
// installationId="ab"+platform="c" packs identically to installationId="a"+
// platform="bc"). Standard encoding includes offsets/lengths for dynamic
// types, preserving field boundaries unambiguously.
function getRegistrationBuffer(request: HarvesterRegistrationRequestDTO) {
  const encoded = abiCoder.encode(
    ["string", "string", "string", "string", "uint256"],
    [
      request.installationId,
      request.platform ?? "",
      request.architecture ?? "",
      request.action,
      request.observedAt,
    ]
  );
  return getBytes(keccak256(encoded));
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
