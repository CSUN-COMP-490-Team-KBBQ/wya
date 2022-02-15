const path = require('path');
const DotenvPlugin = require('dotenv-webpack');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

const root = path.resolve(__dirname, '../../');

module.exports = {
  target: 'web',
  mode: `${process.env.NODE_ENV}`,
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new DotenvPlugin({
      path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`),
    }),
    new MomentLocalesPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    modules: [path.resolve(root, 'node_modules'), 'node_modules'],
    fallback: {
      buffer: require.resolve('buffer/'),
      child_process: false,
      constants: require.resolve('constants-browserify'),
      crypto: require.resolve('crypto-browserify'),
      dns: false,
      fs: false,
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      net: false,
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      tls: false,
      tty: require.resolve('tty-browserify'),
      url: require.resolve('url/'),
      zlib: require.resolve('browserify-zlib'),
    },
  },
  externals: {
    'firebase-admin': 'firebase-admin',
  },
};
