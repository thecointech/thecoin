import { log } from "@thecointech/logging";
import { processorFn } from "./types";
import { Agent } from "../agent";
import { apis } from "../apis";

export const Logout = processorFn("Logout", async (agent: Agent)  => {
  await using mgr = agent.events.pushSection("Logout");
  try {
    return await logout(agent);
  }
  catch (err) {
    // Logging out is nice, but not essential.  If it fails for any reason,
    // cancel this section and move on.
    log.warn(err, "Logout may have failed, URL did not update but could not click again")
    mgr.cancel();
  }
  return false;
})

async function logout(agent: Agent) {

  const currUrl = agent.page.page.url();

  log.info(" ** Logout");
  const api = await apis().getLoginApi();

  const didClick = await agent.page.tryClick(api, "detectLogoutElement", "logout");
  if (!didClick) {
    await agent.maybeThrow(new Error("Failed to click logout"));
  }

  if (!didLogOut(agent, currUrl)) {
    // If we are still logged in, try clicking again
    try {
      const clickedAgain = await agent.page.tryClick(api, "detectLogoutElement", "logout-menu");
      if (!clickedAgain) {
        await agent.maybeThrow(new Error("Failed to click logout again"));
      }
    }
    catch (err) {
      // This could be a false positive, so just log it and continue
      log.warn(err, "Logout may have failed, URL did not update but could not click again")
    }
  }

  // Log the intent.  This isn't really so much as to use it as a sanity check
  // (also, it means we trigger a screenshot post-logout for the testing repo)
  const intentApi = await apis().getIntentApi();
  const { data: response } = await intentApi.pageIntent(await agent.page.getImage());
  log.debug("Logout complete, detected type: " + response.type);
  return true;
}

function didLogOut(agent: Agent, currUrl: string) {
  const newUrl = agent.page.page.url();
  // If the URL doesn't update we assume the logout isn't complete
  if (newUrl === currUrl) {
    return false;
  }

  // The URL should be a reliable indicator of whether we are logged out
  // If it has changed, then we can assume we are logged out,
  // if not, we cannot assume we have no matter what the detected intent
  return true;
}
