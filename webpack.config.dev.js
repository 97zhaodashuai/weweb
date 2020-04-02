/*
 * 直接打包至 wewbTmp 目录，调试用
 */

const glob = require('glob')

const webpack = require('webpack')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const DIST_PATH = './wewebTmp/dist/script'
const isProd = process.env.NODE_ENV === 'production'
const showAnalysis = process.env.ANA === 'true'
const watch = process.env.WATCH === 'true'
// 将 css 从文本中提取出来，参数为资源存放的位置
let plugins = [new ExtractTextPlugin('../css/weweb.min.css')]
if (showAnalysis) {
  plugins = plugins.concat([new BundleAnalyzerPlugin()])
}
if (isProd) {
  console.log('isPord')
  plugins = plugins.concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('no')
      }
    }),
    new webpack.optimize.AggressiveMergingPlugin(), // Merge chunks
    new webpack.optimize.UglifyJsPlugin({
      // sourceMap: true,
      compress: {
        warnings: false,
        drop_debugger: false,
        dead_code: false,
        properties: false,
        evaluate: false
      },
      output: {
        comments: true
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ])
} else {
}

function getPath (rPath) {
  return path.resolve(__dirname, rPath)
}

function getSourcePath (rPath) {
  return getPath(`./src/${rPath}`)
}

function entries (globPath) {
  var files = glob.sync(globPath)
  var entries = {},
    entry,
    dirname,
    basename

  for (var i = 0; i < files.length; i++) {
    entry = files[i]
    dirname = path.dirname(entry)
    basename = path.basename(entry, '.js')
    entries[path.join(dirname, basename)] = './' + entry
  }

  console.log(entries)

  return entries
}

function getEntry () {
  var entry = {}
  glob.sync('./src/**/*.js').forEach(function (name) {
    var n = name.slice(name.lastIndexOf('src/') + 3, name.length - 3)
    // n = n.slice(0, n.lastIndexOf('.') - 1);
    entry[n] = name
  })
  console.log(entry)
  return entry
}

module.exports = {
  entry: entries('./src/**/*.js'),
  output: {
    // path: getPath(DIST_PATH),
    // publicPath: '/script/',
    path: path.join(__dirname, 'wewebTmp', 'dist1', 'script1'),
    publicPath: '/dist1/script1/',
    filename: '[name].js',
    chunkFilename: '[name].wd.chunk.js'
  },
  watch: watch,
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['env', 'stage-0']
        }
      },
      {
        test: /\.html/,
        loader: 'html-loader'
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: {
            loader: 'css-loader',
            options: {
              minimize: true
            }
          }
        })
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          // 注意此处 outputPath 为输出结果的地址
          'file-loader?name=[name].[ext]&publicPath=&outputPath=../images/'
          // 'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      },
      {
        test: /\.et/,
        loader: 'ei-loader'
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  stats: {
    modulesSort: 'size',
    chunksSort: 'size',
    assetsSort: 'size'
  },
  plugins: plugins,
  devtool: 'eval-source-map'
}
