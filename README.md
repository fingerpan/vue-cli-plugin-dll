
# vue-cli-plugin-dll [![vue-cli3](https://img.shields.io/badge/vue--cli-3.x-brightgreen.svg)](https://github.com/vuejs/vue-cli)
Vue CLI 3 plugin for Dll and DllReference


## English | [中文](https://github.com/fingerpan/vue-cli-plugin-dll/wiki/README.%E4%B8%AD%E6%96%87)



## Getting started

> make sure you have vue-cli 3.x.x
```
vue -V
```

### Install
``` bash
vue add dll 

# OR 

vue invoke dll
```


### Quick Start
> Simple configuration [more]()

#### you can config options of `pluginOptions` in `vue.config.js`:
```javascript
// vue.config.js

 module.exports = {
    pluginOptions: {
        dll: {
            entry: ['vue', 'vue-route']
        }
    }
 }
```

### Build Dll

```bash
npm run dll

#OR

npx vue-cli-service dll
```

## Configuration
> vue.config.js:
``` javascript
module.exports = {
  // Other options...

  pluginOptions: {
    dll: {
      // Enable DllReferencePlugin 
      open: true,
      // vonder entry
      entry: ''
      // chunk and manifest file dir
      output: ''
    }
  }
}
```

## options

| name | type/value-set | des | default | required |
| :--- | :--- | :--- | :--- | :--- |
| entry | Object/Array/String | vendor entry | null | true 
| open | Boolean | Enable DllReferencePlugin  | true | false 
| output | String | chunk and manifest file dir | 'yourProjectPath/public/dll' | false 
| inject | true/false/'auto' | auto inject chunk | 'auto' |  false

## more Expamle
### entry config
> the entry can be configured via the pluginOptions in vue.config.js
``` javascript
module.exports = {
  // Other options...

  pluginOptions: {
      dll: {
           // Single entry
          entry: ['vue', 'axios'],

          // Multiple entry
          entry: {
            vendorNameOne: ['vue-route'],
            vendorNameTwo: ['vue-vuex'], 
         }
      }
   }
}
```
