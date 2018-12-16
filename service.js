const {
    log,
    isInstallOf,
    forEachObj,
    isFunctionAndCall
} = require('./src/helper')

const Dll = require('./src/Dll.js')

module.exports = (api, options) => {
    const webpack = require('webpack')
    let dllConfig = (options.pluginOptions && options.pluginOptions.dll) || {}
    let dllInstall = new Dll(api.resolveWebpackConfig(), dllConfig)

    api.chainWebpack((config) => {
        if (!dllInstall.isOpen || dllInstall.isCommand === true) return

        let referenceArgs = dllInstall.resolveDllReferenceArgs()

        config
            .when(referenceArgs.length !== 0, config => {
                // add DllReferencePlugin
                referenceArgs.forEach(args => {
                    config.plugin(`dll-reference-${args.manifest.name}`).use(webpack.DllReferencePlugin, [args])
                })

                // auto inject
                if (dllInstall.inject) {
                    config
                        .plugin(`add-asset-html`)
                        .use(require('add-asset-html-webpack-plugin'), dllInstall.resolveAddAssetHtmlArgs())

                    config
                        .plugin('copy')
                        .tap(args => {
                            args[0][0].ignore.push(dllInstall.outputDir + '/**')
                            args[0].push({
                                from: dllInstall.outputPath,
                                toType: 'dir',
                                ignore: ['*.js', '*.css', '*.manifest.json']
                            })
                            return args
                        });
                }
            })
    })

    api.registerCommand('dll', {
        description: 'build dll',
        usage: 'vue-cli-service dll',
        options: {}
    }, async function dll(args) {
        dllInstall.callCommand()

        // entry is must be
        if (!dllInstall.validateEntry()) {
            throw Error('"entry" parameter no found, more config url:')
        }

        const FileNameCachePlugin = require('./src/fileNameCachePlugin')

        api.chainWebpack((config) => {
            config
                .plugin('dll').use(webpack.DllPlugin, dllInstall.resolveDllArgs())
                .end()
                .plugin('file-list-plugin').use(FileNameCachePlugin)

            config.optimization.delete('splitChunks')
            config.devtool(false)

            // set output
            forEachObj(dllInstall.resolveOutput(), (fnName, value) => {
                isFunctionAndCall(config.output[fnName], config.output, value)
            })
        })

        let webpackConfig = api.resolveWebpackConfig()
        let VueLoaderPlugin = require('vue-loader/lib/plugin')
        let DefinePlugin = require('webpack/lib/DefinePlugin')
        let FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
        let NamedChunksPlugin = require('webpack/lib/NamedChunksPlugin')
        let MiniCssExtreactPlugin = require('mini-css-extract-plugin')
        let fs = require('fs-extra')

        // filter plugins
        webpackConfig.plugins = webpackConfig.plugins.filter(i => isInstallOf(i,
            VueLoaderPlugin,
            DefinePlugin,
            FriendlyErrorsWebpackPlugin,
            NamedChunksPlugin,
            MiniCssExtreactPlugin,
            webpack.DllPlugin,
            FileNameCachePlugin,
        ))

        // reset entry
        webpackConfig.entry = dllInstall.resolveEntry()

        // remove dir
        fs.remove(dllInstall.outputPath)

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
    })
}

module.exports.defaultModes = {
    dll: 'production',
}