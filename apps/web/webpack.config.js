const path = require('path');
const DotenvPlugin = require('dotenv-webpack');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');

const root = path.resolve(__dirname, '../../');
const isProduction = process.env.NODE_ENV === 'production' ?? false;

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
    new CopyPlugin({
      patterns: [
        {
          from: 'public',
          filter: async (resourcePath) => !resourcePath.endsWith('html'),
          to: './',
        },
      ],
    }),
    new HtmlWebpackPlugin({
      title: 'wya?',
      publicPath: './',
      scriptLoading: 'defer',
      showErrors: !isProduction,
      inject: true,
      template: './public/index.html',
      minify: isProduction,
    }),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, {
      PUBLIC_URL: '.',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
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
    modules: [
      path.resolve(root, 'node_modules'),
      path.resolve(__dirname, 'node_modules'),
    ],
    // Polyfilling for native node modules
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
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
      watch: true,
    },
    port: 3000,
    open: true,
    hot: true,
  },
};
