const {
    log,
    isInstallOf,
    forEachObj,
    isFunctionAndCall
} = require('./src/helper')

const Dll = require('./src/dll.js')

module.exports = (api, options) => {
    const webpack = require('webpack')
    const dllConfig = (options.pluginOptions && options.pluginOptions.dll) || {}
    const dll = new Dll(api.resolveWebpackConfig(), dllConfig)

    api.chainWebpack(config => {
        if (!dll.isOpen || dll.isCommand === true) return

        const referenceArgs = dll.resolveDllReferenceArgs()

        config.when(referenceArgs.length !== 0, config => {
            // add DllReferencePlugins
            referenceArgs.forEach(args => {
                config
                    .plugin(`dll-reference-${args.manifest.name}`)
                    .use(webpack.DllReferencePlugin, [args])
            })

            // auto inject
            if (dll.inject) {
                config
                    .plugin('dll-add-asset-html')
                    .use(
                        require('add-asset-html-webpack-plugin'),
                        dll.resolveAddAssetHtmlArgs()
                    )
                if(config.plugins.has('copy')) {
                    // add copy agrs
                    config.plugin('copy').tap(args => {
                        args[0][0].ignore.push(dll.outputDir + '/**')
                        args[0].push({
                            from: dll.outputPath,
                            toType: 'dir',
                            ignore: ['*.js', '*.css', '*.manifest.json']
                        })
                        return args
                    })
                }
            }
        })
    })

    api.registerCommand(
        'dll',
        {
            description: 'build dll',
            usage: 'vue-cli-service dll',
            options: {}
        },
        async function(args) {
            dll.callCommand()

            // entry parameter can not be empty
            if (!dll.validateEntry()) {
                throw Error('"entry" parameter no found, more config url:')
            }

            const FileNameCachePlugin = require('./src/fileNameCachePlugin')

            api.chainWebpack(config => {
                config
                    .plugin('dll')
                    .use(webpack.DllPlugin, dll.resolveDllArgs())
                    .end()
                    .plugin('file-list-plugin')
                    .use(FileNameCachePlugin)

                config.optimization.delete('splitChunks')
                config.optimization.delete('runtimeChunk')
                config.devtool(false)

                // set output
                forEachObj(dll.resolveOutput(), (fnName, value) => {
                    isFunctionAndCall(
                        config.output[fnName],
                        config.output,
                        value
                    )
                })
            })

            let webpackConfig = api.resolveWebpackConfig()
            let { VueLoaderPlugin } = require('vue-loader')
            let DefinePlugin = require('webpack/lib/DefinePlugin')
            let FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
            let NamedChunksPlugin = require('webpack/lib/NamedChunksPlugin')
            let MiniCssExtreactPlugin = require('mini-css-extract-plugin')
            let OptimizeCssnanoPlugin = require('@intervolga/optimize-cssnano-plugin')
            let fs = require('fs-extra')

            // filter plugins
            webpackConfig.plugins = webpackConfig.plugins.filter(i =>
                isInstallOf(
                    i,
                    VueLoaderPlugin,
                    DefinePlugin,
                    FriendlyErrorsWebpackPlugin,
                    NamedChunksPlugin,
                    MiniCssExtreactPlugin,
                    webpack.DllPlugin,
                    FileNameCachePlugin,
                    OptimizeCssnanoPlugin
                )
            )

            // reset entry
            webpackConfig.entry = dll.resolveEntry()

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
    dll: 'production'
}
