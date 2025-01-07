import { jest } from '@jest/globals'
import { SimilarityPipeline } from './similarity';
import { patchOnnxForJest } from '../../internal/jestPatch';

patchOnnxForJest();

jest.setTimeout(60 * 1000);
it('computes similarity', async () => {
    const similarities = await SimilarityPipeline.calculateSimilarity(
        'King', 
        [
            'Queen',
            'Kind', 
            'Chess',
            'Chest'
        ]
    );
    // Queen is the most similar
    expect(Math.max(...similarities)).toEqual(similarities[0]);
    // Chess is the next most similar
    expect(Math.max(...similarities.slice(1))).toEqual(similarities[2]);
})

// This doesn't work.  What am I missing here?
// it('similarity is does not depend on array siblings', async () => {
//     const sim1 = await SimilarityPipeline.calculateSimilarity(
//         'King', [ 'Queen', ]
//     );
//     const sim2 = await SimilarityPipeline.calculateSimilarity(
//         'King', [ 'Queen', 'Duke' ]
//     );
//     expect(sim1[0]).toEqual(sim2[0]);
// })