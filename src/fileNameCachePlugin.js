const fs = require('fs')
const path = require('path')

const cacheFileName = 'cache.dll.json'
const cacheFilePath = path.resolve(__dirname, './', cacheFileName)

module.exports = class FileNameCachePlugin {
    static saveCacheFileNameList(list) {
        fs.writeFile(cacheFilePath, JSON.stringify(list))
    }

    static getCacheFileNameList() {
        let data = null
        try {
            data = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'))
        } catch (e) {
            data = '[]'
        }
        return data
    }
    apply(compiler) {
        compiler.hooks.emit.tapAsync('FileNameCachePlugin', (compilation, callback) => {
            // save last run dll command output name
            FileNameCachePlugin.saveCacheFileNameList(Object.keys(compilation.assets))
            callback();
        });
    }
}