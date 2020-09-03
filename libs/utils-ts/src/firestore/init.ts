import { IsDebug } from '../IsDebug';

export async function init({ project, username, password }: { project?: string; username?: string; password?: string; })
{
  if (process.env.GAE_ENV) // Release build, running on server
  {
    const server = await import('./server')
    return await server.init();
  }
  else if (password && username)
  {
    const pwd = await import('./password');
    return await pwd.init(username, password);
  }
  else if (IsDebug) // Debug build, connect to localhost emulator
  {
    if (!project)
      throw new Error('Cannot create dv without a project');
    const debug = await import('./debug');
    return await debug.init(project);
  }
  else // Release build, running locally (should still talk to server)
  {
    const release = await import('./release')
    return await release.init();
  }
}
