const {
  log,
  isInstallOf,
  forEachObj,
  isFunctionAndCall,
} = require('./src/helper')

const Dll = require('./src/dll.js')

module.exports = (api, options) => {
  const webpack = require('webpack')
  const dllConfig = (options.pluginOptions && options.pluginOptions.dll) || {}
  const dll = new Dll(api.resolveWebpackConfig(), dllConfig)

  api.registerCommand(
    'dll',
    {
      description: 'build dll',
      usage: 'vue-cli-service dll',
      options: {
        '--mode': 'specify env mode (default: production)',
        '--inspect': 'output webpack config ',
        '--verbose': 'show full function definitions in output',
      },
    },
    async function (args) {
      dll.callCommand()

      // entry parameter can not be empty
      if (!dll.validateEntry()) {
        throw Error('"entry" parameter no found, more config url:')
      }

      const FileNameCachePlugin = require('./src/fileNameCachePlugin')

      const { DllPlugin } = webpack
      api.chainWebpack((config) => {
        config
          .plugin('dll')
          .use(DllPlugin, dll.resolveDllArgs())
          .end()
          .plugin('file-list-plugin')
          .use(FileNameCachePlugin)

        config.optimization.delete('splitChunks')
        config.optimization.delete('runtimeChunk')

        // set output
        forEachObj(dll.resolveOutput(), (fnName, value) => {
          isFunctionAndCall(config.output[fnName], config.output, value)
        })
      })

      const webpackConfig = api.resolveWebpackConfig()
      const { VueLoaderPlugin } = require('vue-loader')
      const DefinePlugin = require('webpack/lib/DefinePlugin')
      const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
      const NamedChunksPlugin = require('webpack/lib/NamedChunksPlugin')
      const MiniCssExtreactPlugin = require('mini-css-extract-plugin')
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
        .BundleAnalyzerPlugin
      const fs = require('fs-extra')

      // filter plugins
      webpackConfig.plugins = webpackConfig.plugins.filter((i) =>
        isInstallOf(
          i,
          VueLoaderPlugin,
          DefinePlugin,
          FriendlyErrorsWebpackPlugin,
          NamedChunksPlugin,
          MiniCssExtreactPlugin,
          webpack.DllPlugin,
          FileNameCachePlugin,
          BundleAnalyzerPlugin
        )
      )

      // reset entry
      webpackConfig.entry = dll.resolveEntry()

      if (args.inspect) {
        const { verbose } = args
        const { toString } = require('webpack-chain')
        const { highlight } = require('cli-highlight')
        const output = toString(webpackConfig, { verbose })
        console.log(highlight(output, { language: 'js' }))
        return
      }

      // remove dir
      fs.remove(dll.outputPath)

      log('Starting build dll...')
      return new Promise((resolve, reject) => {
        webpack(webpackConfig, (err, stats) => {
          if (err) {
            return reject(err)
          } else if (stats.hasErrors()) {
            return reject(new Error('Build failed with errors.'))
          }

          log('Build complete.')
          resolve()
        })
      })
    }
  )
}

module.exports.defaultModes = {
  dll: 'production',
}
