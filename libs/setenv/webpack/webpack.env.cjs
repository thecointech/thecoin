const { resolve } = require('path');

//
// Mocking packages for webpack (used by sites & admin)
//
const mocksFolder = resolve(__dirname, '../../__mocks__/');

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
    modules: [mocksFolder]
  }
}

const liveMocks = {
  // Only expose limited mocks
  resolve: {
    alias: {
      "googleapis": resolve(mocksFolder, "googleapis.ts"),
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

module.exports = {
  module: compileMocks,
  ...getMocks(),
}
