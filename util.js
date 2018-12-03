/**
 * is plain object
 * @param {any} i validate source
 * @return {Boolean} result
 */
const isObject = (i) => Object.prototype.toString.call(i) === '[object Object]'

/**
 * forEach Object
 * @param {Object} obj target Source
 * @param {*} callback callback
 */
const forEachObj = (obj, callback) => {
    if (!isObject(obj)) return false
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) callback(key, obj[key])
    }
    return obj
}

/**
 * is function to call
 * @param {Function} fn target Func
 * @param {Object} context fn context
 * @param {...any} args fn arguments
 * @returns result of function call
 */
const isFunctionAndCall = (fn, context, ...args) => {
    return typeof fn === 'function' && fn.apply(context, args)
}

/**
 * extend object
 * @param {Object} target target
 * @param {...Object} sources sourceList
 * @returns {Object} target
 */
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

// match dll
const MatchEntryNameREG = /^(dll)$|^dll_([a-zA-Z]+)/
exports.MatchEntryName_REG = MatchEntryNameREG
exports.getEntryByWConfig = (entry) => {
    if (!isObject(entry)) {
        return {}
    }
    let entryKeys = Object.keys(entry)
    return entryKeys
        .map(i => {
            let result = i.match(MatchEntryNameREG)
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

exports.normalizeRntry = (entry = {}) => {
    if (!isObject(entry) && entry) {
        entry = {
            dll: entry
        }
    }

    forEachObj(entry, (name, entryValue) => {
        entry[name] = Array.isArray(entryValue) ? entryValue : [entryValue]
    })
    return entry
}

exports.tryGetManifestJson = (jsonPath) => {
    let getJon = null
    try {
        getJon = require(jsonPath)
    } catch (e) {
        log(' ')
        log('vue-cli-plugin-dll warning!! miss manifest.json')
        log(' ')
        log(' ')
        log(`no found ${jsonPath}`)
        log(' ')
        log(`if you want to use DllReferencePlugin，execute the command 'npm run dll' first`)
        log(' ')
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
