import { log } from '@thecointech/logging';

type Plugins = Record<string, { address: string, code: string }>;

export async function getSourceCode(args: {address?: string, name?: string}) {
  try {
    const raw = await fetch("/_plugins_src");
    const plugins = await raw.json() as Plugins;
    if (args.name) {
      return plugins[args.name].code;
    }
    else {
      const plugin = Object.values(plugins).find(p => p.address === args.address);
      return plugin?.code;
    }
  }
  catch(e) {
    log.error("Could not load plugin code", e);
  }
  return null;
}
