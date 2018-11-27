
const log = (msg) => {
    msg && console && console.log && console.log(msg)
}




module.exports = (api, options) => {
    api.registerCommand('dll', {
        description: 'build dll ventor',
        usage: 'vue-cli-service dll',
        options: {}
    }, async function dll(args) {
        log('Starting build dll...')


        // 
        let dllConfig = options.pluginOptions.dll
        if (!dllConfig) {
            throw Error('dll')
        }

        // although this is primarily a dev server, it is possible that we
        // are running it in a mode with a production env, e.g. in E2E tests.
        // const isInContainer = checkInContainer()
        const isProduction = process.env.NODE_ENV === 'production'
        const webpack = require('webpack')
        const HtmlWebpackPlugin = require('html-webpack-plugin')


        // todo
        // do more 



        // resolve webpack config
        const webpackConfig = api.resolveWebpackConfig()


        // 更新配置
        let plugins = webpackConfig.plugins = webpackConfig.plugins || []

        // remove DllReferencePlugin HtmlWebpackPlugin
        plugins = plugins.filter(i => !(i instanceof webpack.DllReferencePlugin || i instanceof HtmlWebpackPlugin))

        // and DllPlugin
        plugins.push(
            new webpack.DllPlugin(dllConfig.DllPlugin)
        )

        // concat plugins
        if (dllConfig.plugins) {
            plugins = plugins.concat(dllConfig.plugins)
        }

        // entry arg
        // output
        const entry = dllConfig.entry
        if (entry) {
            webpackConfig.entry = entry
            webpackConfig.output = dllConfig.output
        }

        webpackConfig.plugins = plugins




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
    serve: 'production'
}