import { Controller, Post, Body, Route, SuccessResponse, Response, FormField, UploadedFile, type File, Tags } from '@tsoa/runtime';
import { gasslessUpdate } from '../nft/gassless';
import { uploadAvatar, uploadMetadata } from '../nft/ipfs';
import { claimNft, type NftClaim } from '../nft/claim';
import type { GasslessUpdateRequest, MetadataJson } from '@thecointech/contract-nft';

type UpdateRequest = {
  signature: string
} & MetadataJson
@Route('nft')
@Tags('NFT')
export class NftController extends Controller {

  /**
   * Allow a user to claim a token.  The user supplies the token they are claiming,
   * it's associated claim code, and their address, and we transfer the token to them
   **/
  @Post('claimNft')
  async claimNft(@Body() claim: NftClaim): Promise<boolean|string> {
    return claimNft(claim);
  }

  /**
   * Perform a gassless update of an NFT's metadata
   * TODO: Should we pack the image in here?
   **/
  @Post('updateNftUri')
  async updateNftUri(@Body() update: GasslessUpdateRequest): Promise<boolean> {
    return gasslessUpdate(update);
  }

  /**
   * Upload an file to IPFS, and return it's URI
   * @param {string} signature
   * @pattern signature ^(0[xX])?[A-Fa-f0-9]{130}$
   **/
  @Post("uploadAvatar")
  @SuccessResponse("201", "Created")
  @Response("400", "Invalid input")
  public async uploadAvatar(@UploadedFile() avatar: File, @FormField() signature: string): Promise<string> {
    const r = await uploadAvatar(avatar.buffer, signature);
    if (r) return r;
    this.setStatus(400);
    return "Upload Failed";
  }

  /**
   * Upload a full metadata file to IPFS, and return it's URI'
   **/
  @Post("uploadMetadata")
  @SuccessResponse("201", "Created")
  @Response("400", "Invalid input")
  public async uploadMetadata(@Body() json: UpdateRequest): Promise<string> {
    const { signature, ...metadata } = json;
    const r = await uploadMetadata(metadata, signature);
    if (r) return r;
    this.setStatus(400);
    return "Upload Failed";
  }
}

