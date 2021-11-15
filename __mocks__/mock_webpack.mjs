import { join, dirname, resolve as _resolve } from 'path';
import { fileURLToPath } from "url";
//
// Mocking packages for webpack (used by sites & admin)
//
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Typescript compilation on __mocks__ folder
const compileMocks = {
  rules: [
    // Allow ts-loader to parse mocks
    {
      test: /\.ts(x?)$/,
      include: __dirname,
      use: {
        loader: 'ts-loader',
        options: {
          configFile: join(__dirname, '..', 'tsconfig.base.json'),
          transpileOnly: true,
          experimentalWatchApi: true,
        },
      },
    }
  ],
}

const allMocks = {
  // Expose all mocks
  resolve: {
    modules: [__dirname]
  }
}

const liveMocks = {
  // Only expose limited mocks
  resolve: {
    alias: {
      "googleapis": _resolve(__dirname, "googleapis.ts"),
    }
  }
}

function getMocks() {
  switch (process.env.CONFIG_NAME) {
    case 'development': {
      console.log(" *** Injecting all webpack mocks");
      return allMocks;
    }
    case 'devlive': {
      console.log(" *** Injecting external webpack mocks");
      return liveMocks;
    }
    default: {
      console.log(" *** WARNING: Not injecting mocks");
      return undefined;
    }
  }
}

export default {
  module: compileMocks,
  ...getMocks(),
}
