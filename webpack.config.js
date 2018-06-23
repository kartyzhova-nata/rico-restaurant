const path = require('path');
const fs   = require('fs');

const devMode = (process.env.NODE_ENV !== 'production');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const srcFolder = path.join(__dirname, config.srcDir);

const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin  = require('html-webpack-plugin');
const CopyWebpackPlugin  = require('copy-webpack-plugin');


const webpackConfig = {
  entry: ['babel-polyfill', './src/js/index.js'],
  output: {
    path: path.join(__dirname, config.bundleDir),
    filename: 'js/bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['public/*']),
    new CopyWebpackPlugin([
      {from: 'src/img', to: 'img'},
      {from: 'src/fonts', to: 'fonts'}
    ])
  ]
};


/* CSS config start -------------------------------------------------------- */
const cssBundlePath = 'css/bundle.css';
if (devMode) {
  const ExtractTextPlugin = require('extract-text-webpack-plugin');

  webpackConfig.module.rules.push({
    test: /\.scss$/,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        {loader: 'css-loader', options: {url: false, sourceMap: true}},
        {loader: 'sass-loader', options: {sourceMap: true}}
      ]
    })
  });

  webpackConfig.plugins.push(new ExtractTextPlugin({filename: cssBundlePath}))
}
else {
  const MiniCssExtractPlugin = require('mini-css-extract-plugin');
  const autoprefixer = require('autoprefixer');
  const cssnano = require('cssnano');

  webpackConfig.module.rules.push({
    test: /\.scss$/,
    use: [
      MiniCssExtractPlugin.loader,
      {loader: 'css-loader', options: { url: false}},
      {loader: 'postcss-loader', options: {plugins: [autoprefixer(), cssnano()]}},
      'sass-loader'
    ]
  });

  webpackConfig.plugins.push(new MiniCssExtractPlugin({ filename: cssBundlePath }))
}
/* CSS config end ---------------------------------------------------------- */


/* HTML config start ------------------------------------------------------- */
// TODO: add support of nested/deep folders
copyHtml('index.html');

const htmlFolderPath = path.join(srcFolder, 'html');

if (fs.existsSync(htmlFolderPath) && fs.statSync(htmlFolderPath).isDirectory()) {
  const contentList = fs.readdirSync(htmlFolderPath);

  for (const fileName of contentList) {
    copyHtml(`html/${fileName}`);
  }
}

function copyHtml(filePath) {
  const absolutePath = path.join(srcFolder, filePath);
  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
    webpackConfig.plugins.push(new HtmlWebpackPlugin({template: absolutePath, filename: filePath}))
  }
}
/* HTML config end --------------------------------------------------------- */


/* Other ------------------------------------------------------------------- */
if (devMode) {
  const LiveReloadPlugin = require('webpack-livereload-plugin');
  webpackConfig.plugins.push(new LiveReloadPlugin({appendScriptTag: true}));

  webpackConfig.devtool ='inline-source-map';
  webpackConfig.mode = 'development';
}
else {
  webpackConfig.mode = 'production';
}


module.exports = webpackConfig;