import path from 'path';
import { existsSync } from 'fs';
import type { ResolveContext, Resolver, ResolveRequest } from 'enhanced-resolve';
// Resolve @/ alias to src

type Callback = (err?: null|Error, result?: ResolveRequest) => void

// Custom resolver plugin for @/ alias
export class DynamicAliasPlugin {
  apply(resolver: Resolver) {
    const target = resolver.ensureHook('resolve');
    resolver.getHook('described-resolve').tapAsync('DynamicAliasPlugin', (request: ResolveRequest, resolveContext: ResolveContext, callback: Callback) => {
      if (request.request && request.request.startsWith('@/')) {
        const context = (request.context as any)?.issuer || request.path;
        const root = projectRoot(context);
        const relativePath = request.request.substring(2); // Remove '@/'
        const newRequest = {
          ...request,
          request: path.join(root, 'src', relativePath)
        };
        resolver.doResolve(target, newRequest, null, resolveContext, callback);
      } else {
        callback();
      }
    });
  }
}


const projectRoot = (context: string): string => {
  const basePath = path.join(context, "..");
  // Prevent infinite recursion at filesystem root
  if (basePath === context) {
    throw new Error(`Could not find package.json starting from ${context}`);
  }
  if (existsSync(path.join(basePath, "package.json"))) {
    return basePath;
  }
  return projectRoot(basePath);
}
