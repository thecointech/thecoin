import path from 'path';
import { existsSync } from 'fs';

// Resolve @/ alias to src
// Possibly should be in webpack.common.ts

// Custom resolver plugin for @/ alias
export class DynamicAliasPlugin {
  apply(resolver: any) {
    const target = resolver.ensureHook('resolve');
    resolver.getHook('described-resolve').tapAsync('DynamicAliasPlugin', (request: any, resolveContext: any, callback: any) => {
      if (request.request && request.request.startsWith('@/')) {
        const context = request.context?.issuer || request.path;
        const root = projectRoot(context);
        const relativePath = request.request.substring(2); // Remove '@/'
        const newRequest = {
          ...request,
          request: path.join(root, 'src', relativePath)
        };
        return resolver.doResolve(target, newRequest, null, resolveContext, callback);
      }
      callback();
    });
  }
}


const projectRoot = (context: string): string => {
  const basePath = path.join(context, "..");
  if (existsSync(path.join(basePath, "package.json"))) {
    return basePath;
  }
  return projectRoot(basePath);
}
