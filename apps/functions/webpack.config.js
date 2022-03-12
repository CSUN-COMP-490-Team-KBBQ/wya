const path = require('path');
const DotenvPlugin = require('dotenv-webpack');
const GeneratePackageJsonWebpackPlugin = require('generate-package-json-webpack-plugin');

const { dependencies } = require('./package.json');

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
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    library: {
      type: 'commonjs',
    },
  },
  plugins: [
    new DotenvPlugin({
      path: path.resolve(root, `.env.${process.env.NODE_ENV}`),
    }),
    new GeneratePackageJsonWebpackPlugin(distPackageJson),
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
};
