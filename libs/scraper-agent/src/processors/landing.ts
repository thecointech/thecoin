import { log } from "@thecointech/logging";
import { processorFn } from "./types";
import type { Agent } from "../agent";
import { apis } from "../apis";

export const Landing = processorFn("Landing", async (agent: Agent) => {
  await navigateToLogin(agent)
})

async function navigateToLogin(agent: Agent) {
  // Handle pages that have login elements on the front page
  const api = await apis().getLandingApi();
  log.trace(`LandingWriter: Navigating to login`);
  const didNavigate = await agent.page.tryClick(api, "navigateToLogin", {
    hints: { eventName: "login", tagName: "button" }
  });
  if (!didNavigate) {
    await agent.maybeThrow(new Error("Failed to navigate to login"));
  }
  agent.onProgress(33);

  // Are we on a login page or did we just open a menu?
  let intent = await agent.page.getPageIntent();
  agent.onProgress(50);
  if (intent == "MenuSelect") {
    // Now, if we are still on the landing page, it may mean that there
    // is a menu open.  Try and find the login link (again) and click it
    await agent.page.tryClick(api, "navigateToLoginMenu", {
      hints: { eventName: "login-menu", tagName: "a" }
    });
    agent.onProgress(66);
    // It's fine if this doesn't work, let's continue and hope for the best

    // Final check
    intent = await agent.page.getPageIntent();
  }

  // We should now be on the login page
  if (intent != "Login") {
    await agent.maybeThrow(new Error("Failed to navigate to login page"));
  }
}
