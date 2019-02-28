const fs = require('fs')
const path = require('path')

const CATCH_FILE_NAME = 'cache.dll.json'
const DEFAULT_CACHE_File_PATH = path.resolve(__dirname, './', CATCH_FILE_NAME)
const PLUGIN_NAME = 'FileNameCachePlugin'
const noop = () => {}

function FileNameCachePlugin() {}

FileNameCachePlugin.cacheFilePath = DEFAULT_CACHE_File_PATH
FileNameCachePlugin.pluginName = PLUGIN_NAME

FileNameCachePlugin.saveCacheFileNameList = function saveCacheFileNameList(
    list
) {
    let cacheFilePath = FileNameCachePlugin.cacheFilePath
    fs.writeFile(cacheFilePath, JSON.stringify(list), noop)
}

FileNameCachePlugin.getCacheFileNameList = function getCacheFileNameList() {
    let data = null
    try {
        data = JSON.parse(
            fs.readFileSync(FileNameCachePlugin.cacheFilePath, 'utf8')
        )
    } catch (e) {
        data = []
    }
    return data
}

FileNameCachePlugin.setCacheFileNamePath = function setCacheFileNamePath(
    absolutePath
) {
    let absoluteFilePath = path.resolve(absolutePath, './', CATCH_FILE_NAME)
    FileNameCachePlugin.cacheFilePath = absoluteFilePath
}

FileNameCachePlugin.prototype.apply = function apply(compiler) {
    compiler.hooks.emit.tapAsync(
        FileNameCachePlugin.pluginName,
        (compilation, callback) => {
            // save last run dll command output name
            FileNameCachePlugin.saveCacheFileNameList(
                Object.keys(compilation.assets)
            )
            callback()
        }
    )
}

module.exports = FileNameCachePlugin
