const path = require('path')
const {
    isObject,
    merge,
    normalizeRntry,
    getEntryByWConfig,
    tryGetManifestJson
} = require('./util')



const defaultConfig = {
    manifest: '[name]-manifest.json',
    filename: '[name].[hash:8].dll.js',
    library: '[name]_library',
    outputDir: './public/dll'
}

module.exports = class Dll {

    constructor(webpackConfig, dllConfig = {
        open: true
    }) {
        this.webpackConfig = webpackConfig
        this.dllConfig = dllConfig
        this.context = webpackConfig.context


        merge(this, defaultConfig)
        this.outputPath = path.join(this.context, this.outputDir)

        // init
        this.initEntry()
        this.initOutputPath()
        this.initOpen()
    }
    /**
     * init entry
     */
    initEntry() {
        this.entry = normalizeRntry(this.dllConfig.entry) || getEntryByWConfig(this.webpackConfig.entery)
    }
    /**
     * normalize outputName
     */
    initOutputPath() {
        let dllConfig = this.dllConfig
        let outputPath = isObject(dllConfig.output) && dllConfig.output.path
        if (outputPath) {
            this.outputPath = outputPath
        }
    }
    /**
     * init isOpen attr
     */
    initOpen() {
        this.isOpen = this.dllConfig.open !== undefined ? this.dllConfig.open : this.validateEntry()
    }


    /**
     * validate has entry
     * @return {boolean}
     */
    validateEntry() {
        return Object.keys(this.entry).length !== 0
    }

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
        return Object.keys(this.resolveEntry()).map((entryName) => {
            let jsonPath = this.resolvePath('./', this.manifest.replace('[name]', entryName))
            let manifest = tryGetManifestJson(jsonPath)
            if (!manifest) return false;
            return {
                context: this.context,
                manifest
            }
        }).filter(i => !!i)
    }
}