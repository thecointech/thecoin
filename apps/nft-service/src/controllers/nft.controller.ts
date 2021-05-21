import { Controller, Post, Body, Route, SuccessResponse, Request } from '@tsoa/runtime';
import { gasslessUpdate } from '../nft/gassless';
import type { GasslessUpdateRequest } from '@thecointech/nft-contract';
import express from 'express';
import multer from "multer";

@Route('nft')
export class NftController extends Controller {

  /**
   * Perform a gassless update of an NFT's metadata
   * TODO: Should we pack the image in here?
   **/
  @Post('updateMeta')
  async updateMetadata(@Body() update: GasslessUpdateRequest) : Promise<boolean>
  {
    return gasslessUpdate(update);
  }

  /**
   * Upload an file to IPFS, and return it's URI
   **/
   @Post("uploadAvatar")
  @SuccessResponse("201", "Created")
  public async uploadAvatar(@Body() signature: string, @Request() request: express.Request): Promise<string> {
    const avatar = await this.handleFile(request);
    validateUpload(avatar, signature)
    const metaUri = await
     // file will be in request.avatar, it is a buffer
     return "Qmazone";
   }


  private handleFile(request: express.Request) {
    // NOTE: the 'avatar' name here must match the merged swagger
    // spec in tsoa.json.
    const multerSingle = multer().single("avatar");
    return new Promise((resolve, reject) => {
      multerSingle(request, undefined as any, async (error) => {
        if (error) {
          reject(error);
        }
        resolve(request.file.buffer);
      });
    });
  }
}

