// A tiny and fast perceptual image hashing algorithm for JavaScript.
// Taken from https://www.npmjs.com/package/prcp, because jest doesn't
// want to transpile it (and because i can't find the original repo)
// MIT Licensed

/**
 * Get the median of an array of numbers.
 *
 * @param {Number[]} array
 * @return {Number}
 */

 function median (array: number[]): number {
  const mid = Math.floor(array.length / 2);
  const num = [...array].sort((a, b) => a - b);

  return array.length % 2 === 0 ? (num[mid - 1] + num[mid]) / 2 : num[mid]
}

/**
 * Get the number of colors in a block.
 *
 * @param {Number} width
 * @param {Number} height
 * @return {Number}
 */
function colors (width: number, height: number): number {
  return width * height * 256 * 4
}

/**
 * Convert binary array to hexadecimal.
 *
 * @param {Number[]} bits
 * @return {String}
 */
function binaryToHexa (bits: number[]): string {
  let output = '';

  for (let i = 0; i < bits.length; i += 4) {
    output += parseInt(bits.slice(i, i + 4).join(''), 2).toString(16);
  }

  return output
}

/**
 * Compute a perceptual image hash.
 *
 * @param {ImageData} image
 * @param {Number} [precision]
 * @return {String}
 */
export function hash(image: ImageData, precision: number = 8): string {
  // This test throws false positive when running in jest
  // if (!(image.data instanceof Uint8Array || image.data instanceof Uint8ClampedArray)) {
  //   throw new Error('Bad image data')
  // }

  if (image.data.length !== image.width * image.height * 4) {
    throw new Error('Bad image dimensions')
  }

  if (Number.isNaN(precision) || precision < 1) {
    throw new Error('Hash precision should be a positive number')
  }

  const blocks = [];

  // Compute the number of pixels per block
  const blockWidth = Math.floor(image.width / precision);
  const blockHeight = Math.floor(image.height / precision);

  // For each block
  for (let i = 0; i < precision; i++) {
    for (let j = 0; j < precision; j++) {
      let sum = 0; // Block value

      // For each pixel inside the block
      for (let x = 0; x < blockWidth; x++) {
        for (let y = 0; y < blockHeight; y++) {
          const px = (i * blockWidth) + x;
          const py = (j * blockHeight) + y;

          // Compute the pixel index
          const pi = (py * image.width + px) * 4;

          // Update the block value based on the pixel color and transparency
          if (image.data[pi + 3] === 0) {
            sum += 765; // Black when the pixel is entirely transparent
          } else {
            sum += image.data[pi] + image.data[pi + 1] + image.data[pi + 2]; // RGB values
          }
        }
      }

      blocks.push(sum);
    }
  }

  // Compute the median value of all blocks
  const m = median(blocks);

  // Compute half the number of pixels in a block
  const h = colors(blockWidth, blockHeight) / 2;

  // Assign 0 or 1 to each block according to their relationship to the median value
  // When the value and the median are equal, decide according to the number of pixels
  const b = blocks.map(v => v === m ? (h < m ? 1 : 0) : (v < m ? 0 : 1));

  // Convert the binary output to hexadecimal to reduce the output size by 4
  return binaryToHexa(b)
};

