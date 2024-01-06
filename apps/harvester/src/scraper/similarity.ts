import { env, pipeline, cos_sim } from '@xenova/transformers';

// NOTE!  The sentence-similarity task is not available in the transformers library
// https://github.com/xenova/transformers.js/issues/110
//static task: PipelineType = 'sentence-similarity';
const task = 'feature-extraction';
// Which model is best? Absolutely no idea :-D
const model = 'HELLOMRKINOBI/all-mpnet-base-v2';

export class SimilarityPipeline {

  static instance: ReturnType<typeof pipeline<typeof task>>;

  static async getInstance(progress_callback?: Function) {
    if (!this.instance) {
      // NOTE: Fix this for deployment etc
      env.cacheDir = './.cache';

      this.instance = pipeline(task, model, { progress_callback });
    }

    return this.instance;
  }

  static async calculateSimilarity(source: string, tests: string[]) {
    const pipeline = await SimilarityPipeline.getInstance();
    const raw = await pipeline([source, ...tests], { pooling: 'cls' });

    // Convert Tensor to JS list
    const [sVec, ...rVecs] = raw.tolist();

    // Compute pairwise cosine similarity 
    const similarity = rVecs.map(v => cos_sim(sVec, v))
    return similarity
    
    // We take the cubic power of the similarity to down-weight the lower values 
    // (while preserving sign).  Every similarity has a value, and the problem is
    // that we want to score similarity quite highly, but we don't want random 
    // connections (eg, jump, terms = 0.23) to have much influence.  This means
    // meanings degrade very quickly, for example (login, sign in => 0.76 ^ 3 == 0.44)
    // but we'll have to wait and see how that actually plays out in practice
    // return similarity.map(s => Math.pow(s, 3))
  }
}