/*
 * Copyright 2017, The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require("vue-loader");
const CopyPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


const prod = (process.env.NODE_ENV === 'production');


module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'build.js'
  },
  mode: prod ? 'production' : 'development',
  module: {
    rules: [
      { test: /\.vue$/, loader: 'vue-loader', options: { loaders: { } /* other vue-loader options go here */ } },
      { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] },
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.proto$/, loader: 'proto-loader', options: { paths: [ path.resolve(__dirname, '.'), path.resolve(__dirname, './external/protobuf/src') ] } },
      { test: /\.(png|jpg|gif|svg)$/, loader: 'file-loader', options: { name: '[name].[ext]?[hash]', esModule: false } },

    ]
  },
  plugins: [ new VueLoaderPlugin() ],
  resolve: {
    modules: [ 'node_modules', path.resolve(__dirname, '.')  ],
  },
  resolveLoader: {
    modules: [ 'node_modules', path.resolve(__dirname, 'loaders') ]
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map',
  optimization: {
    minimizer: []
  }
}


if (prod) {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ]);

  module.exports.optimization.minimizer.push(
    new UglifyJsPlugin({
      uglifyOptions:{
        sourceMap: true
      }
    })
  );

}

module.exports.plugins = (module.exports.plugins || []).concat([
  new HtmlWebpackPlugin({
    inlineSource: prod ? '.(js|css)' : false,
    template: 'src/index_template.html'
  }),
  new CopyPlugin([
    { from: './src/workers', to: 'workers' }
  ]),
  new WriteFilePlugin({
    test: /^(?!.*(hot)).*/,
  })
]);
