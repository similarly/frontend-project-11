const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: path.resolve(__dirname, './src/js/index.js'),
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundles.js',
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'webpack output',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  'autoprefixer',
                ],
              },
            },
          },
          { loader: 'sass-loader' },
        ],
      },
    ],
  },
};
