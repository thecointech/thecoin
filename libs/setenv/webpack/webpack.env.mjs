import { fileURLToPath } from "url";

//
// Mocking packages for webpack (used by sites & admin)
//
const mocksUrl = new URL('../../__mocks__/', import.meta.url);
const mocksFolder = fileURLToPath(mocksUrl);

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
          configFile: fileURLToPath(new URL('./tsconfig.json', mocksUrl)),
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
    modules: [mocksFolder]
  }
}

const liveMocks = {
  // Only expose limited mocks
  resolve: {
    alias: {
      "googleapis": new URL( "googleapis.ts", mocksUrl),
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
