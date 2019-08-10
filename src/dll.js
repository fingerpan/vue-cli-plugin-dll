const path = require('path')
const {
    isObject,
    merge,
    normalizeRntry,
    tryGetManifestJson,
    replaceAsyncName,
    getAssetHtmlPluginDefaultArg,
    isAcceptTypeByAssetPluginByPath,
    compose
} = require('./helper')
const {
    getCacheFileNameList,
    setCacheFileNamePath
} = require('./fileNameCachePlugin')

/**
 * class Dll
 */
module.exports = class Dll {
    /**
     * dll default config
     */
    static getDllDefaultConfig() {
        return {
            // 是否开启dll
            open: true,
            // 自动将vender文件注入
            inject: true
        }
    }
    static getDefaultConfig() {
        return {
            // manifeat file
            manifest: '[name].manifest.json',
            // output fileName
            filename: '[name].[hash:8].dll.js',
            // common library name
            library: '[name]_library',
            // the name of directory specified after output
            outputDir: 'dll'
        }
    }

    constructor(webpackConfig = {}, dllConfig = {}) {
        this.webpackConfig = webpackConfig
        this.dllConfig = merge(Dll.getDllDefaultConfig(), dllConfig)
        this.context = webpackConfig.context
        this.isCommand = false
        this.isOpen = false
        this.inject = this.dllConfig.inject

        // TODO: release more option
        merge(this, Dll.getDefaultConfig())

        // init
        this.initEntry()
        this.initOutputPath()
        this.initOpen()
        this.initCatchPath()
    }

    // init options ------
    // init entey
    initEntry() {
        this.entry = normalizeRntry(this.dllConfig.entry)
    }
    initOutputPath() {
        let output = this.dllConfig.output
            // normal
        if (typeof output === 'string') {
            output = {
                path: output
            }
        }
        if (output && !isObject(output)) {
            output = null
                // TODO:
            console.warn(`type check failed for output parameter, Expected Object or String`)
        }
        const DEFAULT_OUTPUT_PATH = path.join(
            this.context,
            './public',
            this.outputDir
        )
        this.outputPath = (output && output.path) || DEFAULT_OUTPUT_PATH
    }
    initOpen() {
        let open = this.dllConfig.open
        this.isOpen = open == true ? this.validateEntry() : open
    }
    initCatchPath() {
        let cacheFilePath = this.dllConfig.cacheFilePath
        if (cacheFilePath) {
            setCacheFileNamePath(cacheFilePath)
        }
    }

    // tool -------------
    /**
     * validate has entry
     * @return {boolean}
     */
    validateEntry() {
        return Object.keys(this.entry).length !== 0
    }

    /**
     * set isCommand if call dll command
     */
    callCommand() {
        this.isCommand = true
    }

    // resolve args ---------------
    /**
     * the method resolves a sequence of paths into an absolute path which relative to outputPath
     * @param  {subPath} args A sequence of paths
     */
    resolvePathRelativeOutputPath(subPath) {
        return path.resolve(this.outputPath, subPath)
    }

    /**
     * get entry config for webpack
     */
    resolveEntry() {
        return JSON.parse(JSON.stringify(this.entry))
    }

    /**
     * get output config for webpack
     */
    resolveOutput() {
        return {
            path: this.outputPath,
            filename: this.filename,
            library: this.library
        }
    }

    /**
     * get dll config for webpack.DllPlugin plugin
     */
    resolveDllArgs() {
        return [{
            path: this.resolvePathRelativeOutputPath(this.manifest),
            name: this.library
        }]
    }

    /**
     * get dllReferenceArgs config for webpack.DllReferenceArgs plugin
     */
    resolveDllReferenceArgs() {
        return Object.keys(this.resolveEntry())
            .map(entryName => {
                const jsonPath = this.resolvePathRelativeOutputPath(
                    this.manifest.replace('[name]', entryName)
                )
                return tryGetManifestJson(jsonPath)
            })
            .filter(i => !!i)
            .map(manifest => {
                return {
                    context: this.context,
                    manifest
                }
            })
    }

    /**
     * get config args for add-asset-html-webpack-plugin plugin
     */
    resolveAddAssetHtmlArgs() {
        const dll = this
        let resolvePathRelativeOutputPathBind = this.resolvePathRelativeOutputPath.bind(
            dll
        )
        let sourceList = getCacheFileNameList().map(
            resolvePathRelativeOutputPathBind
        )
        let assetHtmlPluginArg

        function _getAssetHtmlPluginDefaultArg(filename) {
            return getAssetHtmlPluginDefaultArg(filename, dll)
        }

        if (sourceList.length > 0) {
            assetHtmlPluginArg = sourceList
                .filter(isAcceptTypeByAssetPluginByPath)
                .map(_getAssetHtmlPluginDefaultArg)
        } else {
            // TODO: remove next verson
            console.warn('您更新最新版本，请您重新构建一下dll文件，执行npm run dll')
            assetHtmlPluginArg = compose(
                _getAssetHtmlPluginDefaultArg,
                resolvePathRelativeOutputPathBind,
                replaceAsyncName
            )(this.filename)
        }
        return [assetHtmlPluginArg]
    }
}