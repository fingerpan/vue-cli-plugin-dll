/**
 * is plain object
 * @param {any} i validate source
 * @return {Boolean} result
 */
const isObject = (i) => Object.prototype.toString.call(i) === '[object Object]'


const forEachObj = (obj, callback) => {
    for (const key in obj) {
        callback(key, obj[key])
    }
}

const isFunctionAndCall = (fn, context, ...args) => {
    return typeof fn === 'function' && fn.apply(context, args)
}

const merge = (target, ...sources) => {
    sources.forEach((sourceItem) => {
        if (!isObject(sourceItem)) {
            return
        }
        forEachObj(sourceItem, (key, value) => {
            target[key] = value
        })
    })
}

const log = (msg) => {
    msg && console && console.log && console.log(msg)
}

const isNewTarget = (target, ClassName) => {
    return target instanceof ClassName
}


const matchEntryName = /^(dll)$|^dll_([a-zA-Z]+)/
exports.getEntryByWConfig = (entry) => {
    if (!isObject(entry)) {
        return {}
    }
    let entryKeys = Object.keys(entry)
    return entryKeys
        .map((i, index) => {
            let result = i.match(matchEntryName)
            if (result) {
                let {
                    1: defaultName,
                    2: entryName
                } = result
                return defaultName || entryName
            }
            return result
        })
        .filter(i => !!i)
        .reduce((newEntry, name) => {
            let enteryKey = name === 'dll' ? name : `dll_${name}`
            newEntry[name] = entry[enteryKey]
            return newEntry
        }, {})
}



exports.normalizeRntry = (entry) => {
    if (isObject(entry)) {
        return entry
    }
    return {
        dll: entry
    }
}

exports.tryGetManifestJson = (jsonPath) => {
    let getJon = null
    try {
        getJon = require(jsonPath)
    } catch (e) {
        // todo 提示，该入口找不到文件入口，请先执行dll
        console.log('warn   ----------------------')
        console.log()
        console.warn(`no found ${jsonPath}`)
        console.log('if you want to use DllReferencePlugin pleace run dll')
    }
    return getJon
}



exports.isObject = isObject
exports.forEachObj = forEachObj
exports.isFunctionAndCall = isFunctionAndCall
exports.merge = merge
exports.log = log
exports.isNewTarget = isNewTarget