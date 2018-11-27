
### Expamle
``` javascript
// vue.config.js
{
    ...,
    configureWebpack: {
         new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require('./public/dll/vondor-manifest.json'),
         })
    },
    pluginOptions: {
        dll: {
            entry: {
                vondor: ['vue', 'vue-router', 't8t-element-ui', 'axios']
            },
            output: {
                path: path.join(__dirname, './public/dll/js'),
                filename: '[name].[hash:8].dll.js',
                library: '[name]_library'
            },
            DllPlugin: {
                path: path.join(__dirname, './public/dll/[name]-manifest.json'),
                name: '[name]_library',
            },
            plugins: [
                new HtmlWebpackPlugin({
                    filename: path.resolve(__dirname, './public/index.html'),
                    template: path.resolve(__dirname, './public/dll/template.html'),
                    inject: true,
                }),
            ]
        }
    }
}
```