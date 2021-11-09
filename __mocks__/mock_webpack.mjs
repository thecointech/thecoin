import { join, resolve as _resolve } from 'path';

//
// Mocking packages for webpack (used by sites & admin)
//

// Typescript compilation on __mocks__ folder
compileMocks = {
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
},

allMocks = {
  // Expose all mocks
  resolve: {
    modules: [__dirname]
  }
}

liveMocks = {
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
