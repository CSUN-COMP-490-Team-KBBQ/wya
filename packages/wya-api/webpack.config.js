const path = require('path');
const DotenvPlugin = require('dotenv-webpack');

const root = path.resolve(__dirname, '../../');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './src/index.ts',
  plugins: [new DotenvPlugin()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: 'tsconfig.json',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    modules: [path.resolve(root, 'node_modules'), 'node_modules'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs',
  },
  externals: {
    'firebase-admin': 'firebase-admin',
  },
};
