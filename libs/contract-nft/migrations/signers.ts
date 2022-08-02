import type { getSigner as srcSigner} from '@thecointech/signers';

export const dynamicImport = new Function('specifier', 'return import(specifier)');
// Prevent ts-node from compiling this import to require
// https://github.com/TypeStrong/ts-node/discussions/1290
export const getSigner: typeof srcSigner = async (signer) => {
  const { getSigner } = await dynamicImport('@thecointech/signers');
  return await getSigner(signer);
}

