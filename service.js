

const {
    log,
    isNewTarget,
    forEachObj,
    isFunctionAndCall
} = require('./util')

const Dll = require('./dll.js')


module.exports = (api, options) => {

    const webpack = require('webpack')

    let dllConfig = options.pluginOptions.dll
    let dllInstall = new Dll(api.resolveWebpackConfig(), dllConfig)


    api.chainWebpack((config) => {
        if (!dllInstall.isOpen) return;

        // add DllReferencePlugin
        let referenceArgs = dllInstall.resolveDllReferenceArgs()
        if (referenceArgs.length !== 0) {
            config
                .plugin('dll-reference')
                .use(webpack.DllReferencePlugin, referenceArgs)
        }
    })


    api.registerCommand('dll', {
        description: 'build dll',
        usage: 'vue-cli-service dll',
        options: {}
    }, async function dll(args) {


        // entry is must be
        if (!dllInstall.validateEntry()) {
            throw Error('"entry" parameter no found, more config url:')
        }


        api.chainWebpack((config) => {
            // and DllPlugin
            config
                .plugin('dll')
                .use(webpack.DllPlugin, dllInstall.resolveDllArgs())

            // clear entry
            config.entryPoints.clear()
            config.optimization.delete('splitChunks')

            // set output
            forEachObj(dllInstall.resolveOutput(), (fnName, value) => {
                isFunctionAndCall(config.output[fnName], config.output, value)
            })

        })

        const HtmlWebpackPlugin = require('html-webpack-plugin')
        let webpackConfig = api.resolveWebpackConfig()

        // remove DllReferencePlugin HtmlWebpackPlugin
        webpackConfig.plugins = webpackConfig.plugins.filter(i => {
            const isNewTarge_curryed = C => isNewTarget(i, c)
            let isRemovePlugin = [
                webpack.DllReferencePlugin,
                HtmlWebpackPlugin
            ].some(isNewTarge_curryed)
            return !isRemovePlugin
        })
        

        // entry output arg
        webpackConfig.entry = dllInstall.resolveEntry()


        console.log(webpackConfig.plugins)
        log('Starting build dll...')

        return new Promise((resolve, reject) => {
            webpack(webpackConfig, (err, stats) => {
                if (err) {
                    return reject(err)
                }

                if (stats.hasErrors()) {
                    return reject(`Build failed with errors.`)
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
