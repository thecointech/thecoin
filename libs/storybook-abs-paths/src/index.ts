import { existsSync } from 'fs';
import { sep } from 'path';
import type { Compiler } from 'webpack';

export class AbsolutePathRemapper {
  checkAbsolute = /^[^.@]/
  checkSourceDir = /(.*(?:\/|\\)src)(?:\/|\\)./

  apply(compiler: Compiler) {
    compiler.hooks.normalModuleFactory.tap("AbsolutePathRemapper", nmf => {
      nmf.hooks.beforeResolve.tap("AbsolutePathRemapper", result => {
        // Skip all modules
        if (result.request.includes("node_modules")) return;
        // first, is this an import we need to check?
        if (!this.checkAbsolute.test(result.request)) return;

        // Is the request from one of our own libraries?
        const match = result.contextInfo.issuer.match(this.checkSourceDir)
        if (!match) return;

        // does the path exist as an absolute path?
        const absPath = `${match[1]}${sep}${result.request}`
        if (existsSync(absPath)) {
          console.log(`Replacing ${result.request} with ${absPath}`);
          result.request = absPath;
        }
      });
    })
  }
}
