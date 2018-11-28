const log = (msg) => {
    msg && console && console.log && console.log(msg)
}




module.exports = (api, options) => {
    api.registerCommand('dll', {
        description: 'build dll',
        usage: 'vue-cli-service dll',
        options: {}
    }, async function dll(args) {
        log('Starting build dll...')


        let dllConfig = options.pluginOptions.dll
        if (!dllConfig) {
            throw Error('dll config no fined by pluginOptions proptoty of vue.config.js')
        }


        const webpack = require('webpack')
        const HtmlWebpackPlugin = require('html-webpack-plugin')
        const webpackConfig = api.resolveWebpackConfig()

        // 更新配置
        webpackConfig.plugins = webpackConfig.plugins || []
        // remove DllReferencePlugin HtmlWebpackPlugin
        webpackConfig.plugins = webpackConfig.plugins.filter(i => !(i instanceof webpack.DllReferencePlugin || i instanceof HtmlWebpackPlugin))

        // and DllPlugin
        webpackConfig.plugins.push(
            new webpack.DllPlugin(dllConfig.DllPlugin)
        )


        // delete splitChunks
        delete webpackConfig.optimization.splitChunks


        // entry arg
        webpackConfig.entry = dllConfig.entry
        webpackConfig.output = dllConfig.output

        webpackConfig.plugins = [...webpackConfig.plugins, ...dllConfig.plugins]


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