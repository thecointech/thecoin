import { env, pipeline, cos_sim } from '@xenova/transformers';

// NOTE!  The sentence-similarity task is not available in the transformers library
// https://github.com/xenova/transformers.js/issues/110
//static task: PipelineType = 'sentence-similarity';
const task = 'feature-extraction';
// Which model is best? Absolutely no idea :-D
const model = 'HELLOMRKINOBI/all-mpnet-base-v2';

type DownloadProgress = {
  status: "initiate" | "progress" | "download" | "done" | "ready";
  name: string
  file: string;
  progress: number;
}
type DownloadProgressCallback = (progress: DownloadProgress) => void

// TODO: Fix this for deployment etc
env.cacheDir = './.cache';
export class SimilarityPipeline {

  // Optionally initialise the pipeline if we need an explicit cacheDir
  static async init(cacheDir: string, progress_callback?: DownloadProgressCallback) {
    env.cacheDir = cacheDir;
    await SimilarityPipeline.getInstance(progress_callback);
  }

  static instance: ReturnType<typeof pipeline<typeof task>>;

  static async getInstance(progress_callback?: DownloadProgressCallback) {
    if (!this.instance) {

      // Wrap in new promise to ensure that instance is assigned
      // before the pipeline begins it's requests (prevents a race condition)
      this.instance = new Promise(async (resolve, reject) => {
        try {
          const r = await pipeline(task, model, { progress_callback });
          resolve(r)
        }
        catch (e) {
          reject(e)
        }
      })
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
