const path = require('path');
const DotenvPlugin = require('dotenv-webpack');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

const root = path.resolve(__dirname, '../../');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    index: './src/index.ts',
    lib: './src/lib/index.ts',
    'modules/cli': './src/modules/cli/index.ts',
    'modules/etl': './src/modules/etl/index.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new DotenvPlugin({
      path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`),
    }),
    new MomentLocalesPlugin(),
    new WebpackManifestPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: path.resolve(__dirname, 'tsconfig.json'),
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    modules: [path.resolve(root, 'node_modules'), 'node_modules'],
  },
};
