const path = require('path')
const { isObject, merge, normalizeRntry, tryGetManifestJson, replaceAsyncName } = require('./util')

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
			outputDir: './public/dll'
		}
	}

	constructor(webpackConfig = {}, dllConfig = {}) {
		this.webpackConfig = webpackConfig
		this.dllConfig = merge(Dll.DefaultDllConfig(), dllConfig)
		this.context = webpackConfig.context || __dirname
		this.isCommand = false
		this.isOpen = false
		this.inject = this.dllConfig.inject

		merge(this, Dll.DefaultConfig())
		this.outputPath = this.dllConfig.output || path.join(this.context, this.outputDir)

		// init
		this.initEntry()
		this.initOutputPath()
		this.initOpen()
	}

	// init options ------
	initEntry() {
		// getEntryByWConfig(this.webpackConfig.entery)
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
		return [
			{
				path: this.resolvePath('./', this.manifest),
				name: this.library
			}
		]
	}

	resolveCleanArgs() {
		let pathList = [ this.filename, this.manifest ].map(replaceAsyncName)
		return [
			pathList,
			{
				root: this.outputPath,
				verbose: true
			}
		]
	}

	resolveDllReferenceArgs() {
		return Object.keys(this.resolveEntry())
			.map((entryName) => {
				let jsonPath = this.resolvePath('./', this.manifest.replace('[name]', entryName))

				// todo，目前只有提示，没有报错
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
		return [
			{
				filepath: this.resolvePath(replaceAsyncName(this.filename))
			}
		]
	}
}
