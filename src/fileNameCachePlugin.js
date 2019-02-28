const fs = require('fs')
const path = require('path')

const CATCH_FILE_NAME = 'cache.dll.json'
const DEFAULT_CACHE_File_PATH = path.resolve(__dirname, './', CATCH_FILE_NAME)
const PLUGIN_NAME = 'FileNameCachePlugin'
const noop =  () => {}

module.exports = class FileNameCachePlugin {
    static cacheFilePath = DEFAULT_CACHE_File_PATH
    // save the output paths as a Cache file
    static saveCacheFileNameList(list) {
        let cacheFilePath = FileNameCachePlugin.cacheFilePath
        fs.writeFile(cacheFilePath, JSON.stringify(list), noop)
    }

    static getCacheFileNameList() {
        let data = null
        try {
            data = JSON.parse(fs.readFileSync(FileNameCachePlugin.cacheFilePath, 'utf8'))
        } catch (e) {
            data = '[]'
        }
        return data
    }

    static setCacheFileNamePath(absolutePath) {
        let absoluteFilePath = path.resolve(absolutePath, './', CATCH_FILE_NAME)
        FileNameCachePlugin.cacheFilePath = absoluteFilePath
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
            // save last run dll command output name
            FileNameCachePlugin.saveCacheFileNameList(Object.keys(compilation.assets))
            callback();
        });
    }
}
