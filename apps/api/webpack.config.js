const path = require('path');
const DotenvPlugin = require('dotenv-webpack');

const root = path.resolve(__dirname, '../../');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    libraryTarget: 'commonjs',
  },
  plugins: [
    new DotenvPlugin({
      path: path.resolve(root, `.env.${process.env.NODE_ENV}`),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: '../tsconfig.json',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    modules: [path.resolve(root, 'node_modules'), 'node_modules'],
  },
  externals: {
    express: 'commonjs express',
    'firebase-admin': 'commonjs firebase-admin',
    'firebase-functions': 'commonjs firebase-functions',
    request: 'commonjs request',
  },
};
