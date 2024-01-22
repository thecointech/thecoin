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

function getMocks(cfgName) {
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

module.exports = function({CONFIG_NAME, NODE_ENV}) {
  return (NODE_ENV === 'production')
    ? {}
    : {
        module: compileMocks,
        ...getMocks(CONFIG_NAME),
      }
}
