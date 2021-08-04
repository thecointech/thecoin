const path = require('path');

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
          configFile: path.join(__dirname, '..', 'tsconfig.base.json'),
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
      "googleapis": path.resolve(__dirname, "googleapis.ts"),
    }
  }
}


module.exports = {
  module: compileMocks,
  ...(
    process.env.SETTINGS === "live"
      ? liveMocks
      : allMocks
  )
}
