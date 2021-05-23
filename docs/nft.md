
# The Coin NFT Reference.

The goal of the NFT project is to create an ERC 721 NFT implementation that gives it's owner the ability to create assets with cryptographic proof of ownership.  This proof-of-ownership is a proxy proof of CO2-neutrality.

## Proof-of-ownership.

To succesfully prove ownership, it is necessary to:
 a) Prove that specific content is owned by me
 b) Be unable to prove that other content is owned by me.

### For images:

Proving authenticity of an image is more complex than standard data, given that we have no control over the final format & display of an image.  A standard hash of binary data will fail if the display platform (eg LinkedIn etc) applies any changes to the data (eg, stripping metadata or compressing the image).

It is also important that the proof of ownership comes from the token owner, not from TheCoin.

For reference, a good discussion of the challenges inherent here is in the paper: "A Secure Perceptual Hash Algorithm for Image Content Authentication" by Li Weng and Bart Preneel.

We will implement a subset of their algorithm using the blockhash-js library: http://blockhash.io/  This library implements a blockhash algorithm that appears sufficiently accurate, and can run in the browser.

Proof of ownership is achieved by linking an image with a token.  This can be done by the tokens owner signing the perceptual hash of an image.  Both the perceptual hash and the signature is stored in image metadata.  Investigations have shown that the `copywrite` field of an images metadata is preserved when uploading to facebook.

 - To prove ownership, derive the signing address from the hash/signature.  The address can then be used to lookup tokens, connecting the hash & signature to a token.
 - It is not possible for a non-owner to generate a hash of an owner.
 - It is possible for a non-owner to copy the hash & signature of an existing image.  To prove the hash/signature apply to an image, generate the perceptual hash of the image at question.  If the hash is identical, it is very likely the image is authentic.  It is possible for image transformations to change the hash of an authentic image, so small variations are likely to be authentic.  Large variations are very unlikely to be authentic.
 - Because of the uncertainties above, the token metadata stores a link to the source image for final resolution.

ERC721 supports a metadata extension that provides additional JSON data for a token.  Each token stores it's link to it's metadata file.  By default, we will host the JSON file on IPFS for security reasons, along with the profile image.  IPFS provides a guarantee of authenticity without further work.

We also add the perceptual hash of the image to the json metadata file.

None of this explicitly requires TC, but we need to provide the tools so users can do this without tech skills.

### Everything else:

In the event a user wishes to sign arbitrary data (future-tech) the JSON data can store a hash of the binary data instead.

### Time-limiting the CO2 neutrality claim.

A token is permanent, but the CO2 neutrality is not.  We also must permit the construction of profile pics once the neutrality has expired in order to maintain token value.  However, we must construct the certification proof without relying on centralized authority.  Our profile pics will/can advertise the year for which CO2 neutrality is applied.  It is possible for a user to manually generate a profile image with claim that is not valid (eg - if neutrality is purchased for 2022, to generate an image again in 2023 with the CO2-neutrality claim).

To mitigate this, each token contains a validity interval when minted.  This validity interval can be read to verify any claims made by a profile picture.

### Limits of automatic verification

The limits to this method is that we can link any image to it's owning token, but we cannot verify the claims of the image.  For example, if an image claims to be token #123, but is actually #12345, there is no way for us to algorithmically verify this ownership.  One possibility - our verification tool can implement OCR to extract the token ID.  This will be effective for profiles we generate due to their known layout.  However this is not guaranteed to be correct, and in the end should not overrule human verification.

### Limiting updates

We will limit the ability to sign new documents to once-per-quarter.  This is to limit the incentive for a token owner to print their claims and immediately resell the token.

This may not be necessary, as selling the token immediately renders the claims on the pic invalid.

# Core components.

## NFT Contract.

The NFT contract is based on the OpenZeppelin reference implementation of ERC721.  Due to the cost of executing anything on the Eth blockchain, the contract itself is minimal, and stores only 3 pieces of data.

 a) The URL of the JSON description.  A token owner may change this.  It may not be changed within 3 months of a prior update.
 b) Timestamp of last update.  Each update checks this timestamp, and updates to now if update proceeds.
 c) Validity Interval: The start/end calendar years this token is valid for.  For example, a token valid for just 2025 would be 2025-2026.

To investiage: how much does this cost?  Would it be worth it to store the validity intervals in a separate json file? (probably not, just due to the reduced safety in that we have to either update the JSON file each release or publish the full mapping without option to change it later)

## IPFS

We use IPFS to securely store a tokens information.  When a user uses our service to update an image, we will automatically upload the data to IPFS and return the URL to the user.  The user can then update their token with this data.

In this way, we provide the storage but the user is still in full control of the token.

(We will need to create our own node for pinning, or perhaps use filecoin for extended storage.)

## Web app

hosted at nft.thecoin.io

Minimal website with backend.  Uses Ethereum wallets running in-browser or arbitrary 3rd-party connections.

 1) Create/Upload/Restore account functionality (duplicate of TheCoin).
   - Does it provide passwordless account recovery?  That would be nice, but does cost us $$$.
 2) Upload base image (signin required)
 3) Apply optional decorations: Some possibilities
   - TC Border
   - CO2 neutral(or)safe
   - Validity years eg (2022-2023) OR Token ID: #12345
 4) Submit image to web app for storage
   - Generate perceptual hash/signature,
   - Store signature in image metadata under "Copyright" field
   - Upload resulting binary data to backend
   - backend stores metadata/image on IPFS (should we verify the proofs?)
   - Return IPFS url of JSON file
   - Client updates token with new metadata URI.
   - Download signed image to clients machine, and/or provide direct link to IPFS image
 5) Validate image claims page (no signin required)
   - Provide image to prove (upload OR by URL)
   - Read hash/signature from copyright field
   - Verify hash:
      - Generate new hash,
      - compare with claimed hash.
      - Display how likely this is to be authentic
   - Get address from perceptual hash/signature
   - Find all tokens owned by address
   - Display the valid claims that this address can make (eg, token ID's and years of CO2 neutrality)


