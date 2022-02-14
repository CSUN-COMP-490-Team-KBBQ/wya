const path = require('path');
const GeneratePackageJsonWebpackPlugin = require('generate-package-json-webpack-plugin');

const { dependencies } = require('./package.json');

// We remove our module from the dependencies because this will be bundled in
delete dependencies['wya-api'];

const distPackageJson = {
  name: 'functions',
  private: true,
  engines: {
    node: '14',
  },
  main: './index.js',
  dependencies,
};

const root = path.resolve(__dirname, '../../');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './src/index.ts',
  plugins: [new GeneratePackageJsonWebpackPlugin(distPackageJson)],
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
    'firebase-functions': 'firebase-functions',
    express: 'express',
  },
};
