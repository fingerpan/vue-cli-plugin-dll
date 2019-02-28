const path = require('path')
const { isObject, merge, normalizeRntry, tryGetManifestJson, replaceAsyncName, getFileType, compose } = require('./helper')
const { getCacheFileNameList, setCacheFileNamePath } = require('./fileNameCachePlugin')
module.exports = class Dll {
    static DefaultDllConfig() {
        return {
            open: 'auto',
            inject: true
        }
    }
    static DefaultConfig() {
        return {
            manifest: '[name].manifest.json',
            filename: '[name].[hash:8].dll.js',
            library: '[name]_library',
            outputDir: 'dll',
        }
    }

    constructor(webpackConfig = {}, dllConfig = {}) {
        this.webpackConfig = webpackConfig
        this.dllConfig = merge(Dll.DefaultDllConfig(), dllConfig)
        this.context = webpackConfig.context
        this.isCommand = false
        this.isOpen = false
        this.inject = this.dllConfig.inject


        merge(this, Dll.DefaultConfig())
        this.outputPath = this.dllConfig.output || path.join(this.context, './public', this.outputDir)

        // init
        this.initEntry()
        this.initOutputPath()
        this.initOpen()
        this.initCatchPath()
    }

    // init options ------
    initEntry() {
        this.entry = normalizeRntry(this.dllConfig.entry)
    }
    initOutputPath() {
        let dllConfig = this.dllConfig
        let outputPath = isObject(dllConfig.output) && dllConfig.output.path
        if (outputPath) {
            this.outputPath = outputPath
        }
    }
    initOpen() {
        let open = this.dllConfig.open
        this.isOpen = open === 'auto' ? this.validateEntry() : open
    }
    initCatchPath() {
        let cacheFilePath = this.dllConfig.cacheFilePath
        if(cacheFilePath) {
            this.setCacheFileNamePath(cacheFilePath)
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

    resolvePath(...args) {
        return path.resolve(this.outputPath, ...args)
    }

    resolveEntry() {
        return JSON.parse(JSON.stringify(this.entry))
    }

    resolveOutput() {
        return {
            path: this.outputPath,
            filename: this.filename,
            library: this.library
        }
    }

    resolveDllArgs() {
        return [{
            path: this.resolvePath('./', this.manifest),
            name: this.library
        }]
    }


    resolveDllReferenceArgs() {
        return Object.keys(this.resolveEntry())
            .map((entryName) => {
                let jsonPath = this.resolvePath('./', this.manifest.replace('[name]', entryName));
                let manifest = tryGetManifestJson(jsonPath)
                if (!manifest) return false
                return {
                    context: this.context,
                    manifest
                }
            })
            .filter((i) => !!i)
    }

    resolveAddAssetHtmlArgs() {
        let list = getCacheFileNameList().map((i) => this.resolvePath(i))
        let assetHtmlPluginArg
        if (list.length > 0) {
            assetHtmlPluginArg = list.map(this._getAssetHtmlPluginDefaultArg.bind(this)).filter(i => i)
        } else {
            assetHtmlPluginArg = compose(
                this._getAssetHtmlPluginDefaultArg.bind(this),
                this.resolvePath.bind(this),
                replaceAsyncName
            )(this.filename)
        }
        return [assetHtmlPluginArg]
    }

    _getAssetHtmlPluginDefaultArg(filepath) {
        // 获取格式
        let typeOfAsset = getFileType(filepath)
        if (!(/js|css/.test(typeOfAsset))) {
            return false
        }
        return {
            filepath,
            includeSourcemap: false,
            typeOfAsset: typeOfAsset,
            publicPath: typeOfAsset,
            outputPath: typeOfAsset
        }
    }
}