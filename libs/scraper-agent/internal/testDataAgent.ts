import { TestData } from "@thecointech/scraper/testutils";
import { Agent } from "@/agent";
import { AgentSerializer } from "@/agentSerializer";
import { mockApi } from "./mockApi";
import path from "path";
import { Section } from "@/processors/types";
import { SectionName } from "@/types";
import { AnswerCallback, MockAskUser, getAnswerFromFileIfExists } from "./mockAskUser";

export class TestDataAgent extends TestData {

  _agent?: Agent;
  async agent(writeElements?: boolean): Promise<Agent> {
    if (this._agent) {
      return this._agent;
    }
    // Always mock API calls
    const mockedApi = mockApi(this);
    // A serializer can optionally write out data
    const serializer = this.maybeSerializer(writeElements);

    const filename = `${this.matchedFolder}/${this.step}.mhtml`;
    const url = `file://${filename.replace(" ", "%20")}`;
    // By default check for the existence of a file.
    const defaultMockAnswers = getAnswerFromFileIfExists(this.matchedFolder, this.step);
    const askUser = new MockAskUser(defaultMockAnswers);
    const agent = await Agent.create(this.target, askUser, url);

    // Store the original dispose method
    const originalDispose = agent[Symbol.asyncDispose];

    // Override the dispose method to include cleanup
    agent[Symbol.asyncDispose] = async () => {
      serializer?.[Symbol.dispose]();
      mockedApi[Symbol.dispose]();
      await originalDispose.call(agent);
    };
    this._agent = agent;
    return agent;
  }

  mockInput(callback: AnswerCallback) {
    if (!this._agent) {
      throw new Error("Agent not created yet");
    }
    const askUser = this._agent.input as MockAskUser;
    askUser.setCallback(callback);
  }

  maybeSerializer(create?: boolean) {
    if (!create) {
      return null;
    }
    const serializer = new AgentSerializer({
      recordFolder: this.matchedFolder,
      target: this.target,
    });

    serializer.onSection(this.getSection());
    serializer.tracker.incrementElement();
    return serializer;
  }

  getSection() {
    const pathParts = this.matchedFolder.split(path.sep);
    for (const part of pathParts) {
      if (Section[part as Section]) {
        return part as SectionName;
      }
    }
    // When processing feature tests, we are not within
    // a regular section, so just use "Manual" as a fallback
    return "Manual" as SectionName;
  }
}


