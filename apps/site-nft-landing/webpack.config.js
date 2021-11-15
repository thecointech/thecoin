const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: './src/app.js',
  output: {
    path: `${__dirname}/build`,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.html$/,
        use: 'html-loader',
      },
      {
        test: /\.less$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "less-loader",
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [{
          loader: 'image-webpack-loader',
          options: {
            mozjpeg: {
              progressive: true,
            },
            optipng: {
              enabled: true,
            },
            // the webp option will enable WEBP
            webp: {
              quality: 100
            },
            svgo: {},
          }
        }],
        type: "asset",
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/en.html",
      filename: 'en.html',
    }),
    new HtmlWebpackPlugin({
      filename: 'fr.html',
      template: './src/fr.html',
    })
  ]
};
