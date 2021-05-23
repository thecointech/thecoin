import { Controller, Post, Body, Route, SuccessResponse, Response, FormField, UploadedFile, File } from '@tsoa/runtime';
import { gasslessUpdate } from '../nft/gassless';
import type { GasslessUpdateRequest, MetadataJson } from '@thecointech/nft-contract';
import { uploadAvatar, uploadMetadata } from '../nft/ipfs';

type UpdateRequest = {
  signature: string
} & MetadataJson
@Route('nft')
export class NftController extends Controller {

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
   * Upload an file to IPFS, and return it's URI
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

