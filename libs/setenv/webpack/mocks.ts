import { resolve } from 'path';
import { fileURLToPath } from 'url';

//
// Mocking packages for webpack (used by sites & admin)
//
const mocksFolder = fileURLToPath(new URL("../../__mocks__", import.meta.url));

// Typescript compilation on __mocks__ folder
const compileMocks = {
  rules: [
    // Allow ts-loader to parse mocks
    {
      test: /.*\.ts(x?)$/,
      include: mocksFolder,
      use: {
        loader: 'ts-loader',
        options: {
          configFile: resolve(mocksFolder, './tsconfig.json'),
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
    modules: [
      mocksFolder,
      'node_modules',
    ]
  }
}

const liveMocks = {
  // Only expose limited mocks
  resolve: {
    alias: {
      "@prismicio/client": resolve(mocksFolder, "@prismicio/client.ts"),
      "googleapis": resolve(mocksFolder, "googleapis", "index.ts"),
    }
  }
}

export function getMockedProjects(cfgName: string|undefined) {
  switch (cfgName) {
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


export function getMocks(env: Record<string, string|undefined>) {
  return (env.NODE_ENV === 'production')
    ? {}
    : {
        module: compileMocks,
        ...getMockedProjects(env.CONFIG_NAME),
      }
}
