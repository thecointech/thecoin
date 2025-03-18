import { getGoogleSecret } from "./index";
import { describe, IsManualRun } from "@thecointech/jestutils";

describe("Can access secrets", () => {
  it ('can access secrets', async () => {
    const secret = await getGoogleSecret('foo', "tccc-testing");
    expect(secret).toBeDefined();
  });
}, IsManualRun);