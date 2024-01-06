import { pipeline, env } from '@xenova/transformers';

// NOTE!  The sentence-similarity task is not available in the transformers library
// https://github.com/xenova/transformers.js/issues/110
//static task: PipelineType = 'sentence-similarity';
const task = 'feature-extraction';
// Which model is best? Absolutely no idea :-D
const model = 'Xenova/all-MiniLM-L6-v2';

export class SimilarityPipeline {

  static instance: ReturnType<typeof pipeline<typeof task>>;

  static async getInstance(progress_callback?: Function) {
    if (this.instance === null) {
      // NOTE: Uncomment this to change the cache directory
      env.cacheDir = './.cache';

      this.instance = pipeline(task, model, { progress_callback });
    }

    return this.instance;
  }

  static async calculateSimilarity(source: string, tests: string[]) {
    const pipeline = await SimilarityPipeline.getInstance();
    const output = pipeline([source, ...tests]);
  }
}