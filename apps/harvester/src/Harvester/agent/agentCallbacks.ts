import { AgentErrorParams, IAgentCallbacks } from "@thecointech/scraper-agent/types";
import { CallbackOptions, TaskSessionBase } from "../taskSessionBase";
import { log } from "@thecointech/logging";
import { maybeCloseModal } from "@thecointech/scraper-agent/modal";
import { notify } from "@/notify";
import { ScraperProgress } from "@thecointech/scraper";


type AgentParams = CallbackOptions & {
  target: string;
}
export class AgentCallbacks extends TaskSessionBase implements IAgentCallbacks {

  constructor(params: AgentParams) {
    super(params, {
      target: params.target,
    })
  }

  async onError(params: AgentErrorParams) {

    log.error(params.err, `Error in Agent: ${params.section}`);

    // Our only AI-enabled option is to close any modal
    const didClose = await maybeCloseModal(params.page);
    if (didClose) {
      // Validation - does this work on live runs?
      // TODO: Remove once confident
      if (process.env.NOTIFY_ON_MODAL_ENCOUNTER) {
        notify({
          title: 'Modal Successfully Closed',
          message: "Closed Modal on page: " + params.page.url(),
        })
      }
    }
    else {
      await this.dumpError(params.page, params.err);
    }
    return didClose;
  }

  onProgress(progress: ScraperProgress) {
    const stepPercent = progress.stepPercent ?? 0;
    const totalPercent = stepPercent + ((progress.step) / progress.total);
    this.subTaskCallback?.({
      subTaskId: progress.stage,
      description: progress.stage,
      percent: totalPercent,
    })
    // TODO: Allow cancellation
    return true;
  }
}
