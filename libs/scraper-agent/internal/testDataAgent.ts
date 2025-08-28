import { TestData } from "@thecointech/scraper/testutils";
import { Agent } from "@/agent";
import { DummyAskUser } from "../tools/recordSamples/dummyAskUser";

import { TestSerializer } from "../tools/recordSamples/testSerializer";
import { mockApi } from "./mockApi";
import path from "path";
import { Section } from "@/processors/types";
import { SectionName } from "@/types";

export class TestDataAgent extends TestData {
  async agent(writeElements?: boolean): Promise<Agent> {
    // Always mock API calls
    const mockedApi = mockApi(this);
    // A serializer can optionally write out data
    const serializer = this.maybeSerializer(writeElements);

    const filename = `${this.matchedFolder}/${this.step}.mhtml`;
    const url = `file://${filename.replace(" ", "%20")}`;
    const answerFile = `${this.matchedFolder}/${this.step}-answers.json`;
    const askUser = new DummyAskUser({}, answerFile);
    const agent = await Agent.create(this.target, askUser, url);

    // Store the original dispose method
    const originalDispose = agent[Symbol.asyncDispose];

    // Override the dispose method to include cleanup
    agent[Symbol.asyncDispose] = async () => {
      serializer?.[Symbol.dispose]();
      mockedApi[Symbol.dispose]();
      await originalDispose.call(agent);
    };

    return agent;
  }

  maybeSerializer(create?: boolean) {
    if (!create) {
      return null;
    }
    const serializer = new TestSerializer({
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
    throw new Error("Failed to find section");
  }
}


