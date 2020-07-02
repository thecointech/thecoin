import { IsDebug } from "@the-coin/utilities/IsDebug";

export async function init()
{
  if (process.env.GAE_ENV) // Release build, running on server
  {
    const server = await import('./server')
    await server.init();

  }
  else if (IsDebug) // Debug build, connect to localhost emulator
  {
    const debug = await import('./debug');
    await debug.init();
  }
  else // Release build, running locally (should still talk to server)
  {
    const release = await import('./release')
    release.init();
  }
}
