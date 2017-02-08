'use strict'
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require('path');
const outputPath = path.resolve(__dirname, 'dist')

const TEST_MODULES = /node_modules/;
const TEST_SCSS_ASSETS = /assets\/.*\.scss$/;

const scssLoader = {
  loader: 'sass-loader',
  options: {
    sourceMap: true,
    includePaths: [
      path.resolve(__dirname, 'node_modules', 'bootstrap', 'scss')
    ]
  }
};

const babelLoader = {
  loader: 'babel-loader',
  query: {
    presets: ['es2015']
  }
};

const webpackConfig = {
  cache: true,
  context: path.resolve(__dirname, 'src'),
  entry: {
    'polyfills': './polyfills.ts',
    'main': './main.ts'
  },
  output: {
    path: outputPath,
    filename: '[name].js',
    sourceMapFilename: '[name].map',
    chunkFilename: '[id].chunk.js'
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)src(\\|\/)linker/,
      path.resolve(__dirname, './src'), {
        // your Angular Async Route paths relative to this root directory
      }
    ),
    new CopyWebpackPlugin([{
      from: 'index.html'
    }, {
      from: 'favicon.png'
    }]),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      chunks: ['main'],
      minChunks(module) {
        return TEST_MODULES.test(module.resource)
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
      hash: true,
      chunksSortMode (module) {
        let name = module.names[0]
        if (name === 'polyfills') {
          return 3;
        }
        if (name === 'vendor') {
          return 2;
        }
        return 1;
      }
    })
  ],
  module: {
    loaders: [
      { test: /\.css$/, loaders: ['raw-loader', 'css-loader'] },
      {
        test: /\.pug$/,
        exclude: TEST_MODULES,
        loaders: ['pug-html-loader']
      },
      // load scss from assets as css styles
      {
        test: TEST_SCSS_ASSETS,
        exclude: TEST_MODULES,
        loaders: ['style-loader', 'css-loader', scssLoader]
      },
      // load scss from app as css strings
      {
        test: /\.scss$/,
        exclude: [TEST_MODULES, TEST_SCSS_ASSETS],
        loaders: ['raw-loader', scssLoader]
      },
      { test: /\.html$/, loader: 'raw-loader' },
      { test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000'}
    ]
  },
  // Default Config
  devtool: 'eval',
  resolve: {
    extensions: [ '.ts', '.js' ],
    modules: [
      'node_modules',
      path.resolve(process.cwd(), 'src')
    ]
  },
  stats: 'errors-only',
  node: {
    global: true,
    crypto: 'empty',
    __dirname: true,
    __filename: true,
    process: true,
    Buffer: false,
    clearImmediate: false,
    setImmediate: false
  },
  devServer: {
    contentBase: outputPath,
    historyApiFallback: true,
    stats: {
			timings: true,
      hash: false,
      assets: false,
			chunks: true,
      chunkModules: false,
			warnings: true,
			colors: true,
			performance: true
    },
    watchOptions: {
      aggregateTimeout: 300,
      poll: 500
    }
  }
};

if (process.env.NODE_ENV === 'production') {

  webpackConfig.devtool = 'source-map'
  webpackConfig.entry.main = 'main.aot.ts'
  webpackConfig.module.loaders.push({
    test: /\.ts$/,
    loaders: [
      babelLoader,
      'awesome-typescript-loader',
      'angular2-template-loader',
      'angular2-router-loader'
    ]
  });
  webpackConfig.plugins.push(
    // new webpack.optimize.UglifyJsPlugin({ minimize: true })
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      output: {
        comments: false
      },
      mangle: {
        screw_ie8: true
      },
      compress: {
        screw_ie8: true,
        warnings: false,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
        negate_iife: false
      }
    })
  )

} else {

  webpackConfig.module.loaders.push(
    {
      test: /\.ts$/,
      loaders: [
        babelLoader,
        'awesome-typescript-loader',
        {
          loader: 'extension-replace-loader',
          query: {
            exts: [
              { from: ".css", to: ".scss" },
              { from: ".html", to: ".pug" }
            ]
          }
        },
        'angular2-template-loader',
        'angular2-router-loader'
      ]
    }
  )

}

module.exports = webpackConfig;
