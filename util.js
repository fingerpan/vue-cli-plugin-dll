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
    return target
}

const log = (msg) => {
    msg && console && console.log && console.log(msg)
}


const isInstallOf = (target, ...classList) => {
    return classList.some(C => target instanceof C)
}


const MatchEntryName_REG = /^(dll)$|^dll_([a-zA-Z]+)/
exports.MatchEntryName_REG = MatchEntryName_REG
exports.getEntryByWConfig = (entry) => {
    if (!isObject(entry)) {
        return {}
    }
    let entryKeys = Object.keys(entry)
    return entryKeys
        .map((i, index) => {
            let result = i.match(MatchEntryName_REG)
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
    if (!isObject(entry)) {
        entry = {
            dll: entry
        }
    }

    Object.keys(entry).forEach(name => {
        let entryValue = entry[name]
        entry[name] = Array.isArray(entryValue) ? entryValue : [entryValue]
    })



    return entry
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

exports.replaceAsyncName = i => i.replace(/\[.+\]/g, '*')


exports.log = log
exports.merge = merge
exports.isObject = isObject
exports.forEachObj = forEachObj
exports.isInstallOf = isInstallOf
exports.isFunctionAndCall = isFunctionAndCall