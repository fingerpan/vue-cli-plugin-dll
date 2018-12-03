const {
    log,
    isInstallOf,
    forEachObj,
    isFunctionAndCall

} = require('./util')

const Dll = require('./dll.js')

module.exports = (api, options) => {
    const webpack = require('webpack')
    let dllConfig = (options.pluginOptions && options.pluginOptions.dll) || {}
    let dllInstall = new Dll(api.resolveWebpackConfig(), dllConfig)

    api.chainWebpack((config) => {
        if (!dllInstall.isOpen || dllInstall.isCommand === true) return

        // add DllReferencePlugin
        let referenceArgs = dllInstall.resolveDllReferenceArgs()

        config
            .when(referenceArgs.length !== 0, config => {
                const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
                referenceArgs.forEach(args => {
                    config.plugin(`dll-reference-${args.manifest.name}`).use(webpack.DllReferencePlugin, [args])
                })

                // auto inject
                if (dllInstall.inject) {
                    config.plugin(`add-asset-html`).use(AddAssetHtmlPlugin, dllInstall.resolveAddAssetHtmlArgs())
                }
            })
    })

    api.registerCommand('dll', {
        description: 'build dll',
        usage: 'vue-cli-service dll',
        options: {}
    }, async function dll (args) {
        dllInstall.callCommand()

        // entry is must be
        if (!dllInstall.validateEntry()) {
            throw Error('"entry" parameter no found, more config url:')
        }

        const cleanwebpackPlugin = require('clean-webpack-plugin')
        api.chainWebpack((config) => {
            // and clean DllPlugin
            config
                .plugin('clean')
                .use(cleanwebpackPlugin, dllInstall.resolveCleanArgs())
                .end()
                .plugin('dll')
                .use(webpack.DllPlugin, dllInstall.resolveDllArgs())

            config.optimization.delete('splitChunks')
            config.devtool(false)

            // set output
            forEachObj(dllInstall.resolveOutput(), (fnName, value) => {
                isFunctionAndCall(config.output[fnName], config.output, value)
            })
        })

        const HtmlWebpackPlugin = require('html-webpack-plugin')
        const PreloadPlugin = require('@vue/preload-webpack-plugin')
        let webpackConfig = api.resolveWebpackConfig()

        // remove DllReferencePlugin HtmlWebpackPlugin
        webpackConfig.plugins = webpackConfig.plugins.filter(i => !isInstallOf(i, webpack.DllReferencePlugin, HtmlWebpackPlugin, PreloadPlugin))

        // entry output arg
        webpackConfig.entry = dllInstall.resolveEntry()

        // return false
        log('Starting build dll...')

        return new Promise((resolve, reject) => {
            webpack(webpackConfig, (err, stats) => {
                if (err) {
                    return reject(err)
                }

                if (stats.hasErrors()) {
                    return reject(new Error('Build failed with errors.'))
                }

                console.log('Build complete.')
                resolve()
            })
        })
    })
}

module.exports.defaultModes = {
    dll: 'production'
}
