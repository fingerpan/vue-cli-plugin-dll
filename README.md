
# vue-cli-plugin-dll [![vue-cli3](https://img.shields.io/badge/vue--cli-3.x-brightgreen.svg)](https://github.com/vuejs/vue-cli) ![npm](https://img.shields.io/npm/dm/vue-cli-plugin-dll.svg) [![npm](https://img.shields.io/npm/v/vue-cli-plugin-dll.svg)](https://www.npmjs.com/package/vue-cli-plugin-dll)  

  This is a vue-cli 3.x plugin for webpack [Dll-Plugin](https://webpack.js.org/plugins/dll-plugin/) that can drastically improve build time performance. `vue-cli-plugin-dll` plugin register `dll` instruction to avoid adding extra webpack config file, it also insert DllReferencePlugin and inject chunk files automatically when you run `dev/build` directives.  
  

### English | [中文](https://github.com/fingerpan/vue-cli-plugin-dll/wiki/zh_cn.md)
## Quick Start

> Make sure you have the vue-cli 3.x.x version installed

``` bash
$ vue -V
```

### Install plugin
``` bash
$ vue add dll

# OR

$vue invoke dll
```

### Simple configuration
```javascript
// vue.config.js

 module.exports = {
    pluginOptions: {
        dll: {
            entry: ['vue', 'vue-route'],
            cacheFilePath: path.resolve(__dirname, './public')
        }
    }
 }
```
### Execution
```bash
$ npm run dll

#OR

$ npx vue-cli-service dll
```


## Configuration

### Options

| Parame | Type | Description| Default | Required |
| :--- | :--- | :--- | :--- | :--- |
| entry | Object/Array/String | entry vendor | null | true
| open | Boolean | whether to add DllReferencePlugin plugin  | true | false
| output | Object | output |  | false
| output.path | String | The output directory as an absolute path | 'yourProjectPath/public/dll' | false
| output.publicPath | Srting | publicPath | '' | false 
| inject | Boolean | auto inject file to index.html | true |  false
| cacheFilePath | String | The path that save vender path| 'yourProjectPath/node_modules/vue-cli-plugin-dll/src' |  false

### vue.config.js
``` javascript
module.exports = {
  // Other options...

  pluginOptions: {
     dll: {
      entry: ['vue'],

      /**
       * the directory path where the vendor files will be generated in 
       * when running vue-cli-service dll
       */
      output: path.join(__dirname, './public/dll'),

      // If you only want to open `dll plugin` during production build, 
      // you can use the following config:
      open: process.env.NODE_ENV === 'production',

      // !! Recommended configuration
      cacheFilePath: path.resolve(__dirname, './public')
    }
  }
}
```

## License
MIT



