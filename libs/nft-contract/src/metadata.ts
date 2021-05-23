export type MetadataJson = {
  // Identifies the asset to which this NFT represents
  name: string;
  // Describes the asset to which this NFT represents
  description: string;
  // A URI pointing to a resource with mime type image/*
  // representing the asset to which this NFT represents.
  // Consider making any images at a width between 320 and 1080 pixels
  // and aspect ratio between 1.91:1 and 4:5 inclusive.
  image: string;

  // We also store the perceptual hash of the image.
  // Storing a canonical version of the hash may simplify
  // future upgrades (?)
  hash: string;
}
