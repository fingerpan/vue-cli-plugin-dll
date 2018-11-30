
# vue-cli-plugin-dll

Vue CLI 3 plugin for Dll and DllReference

[![vue-cli3](https://img.shields.io/badge/vue--cli-3.x-brightgreen.svg)](https://github.com/vuejs/vue-cli)


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

#### you can config vondor in entry
```javascript
 // vue.config.js

 module.exports = {
    entry: {
        dll: ['vue', 'vue-route']
    }
 }
```
#### if you want make your configuration clear, you can config options of `pluginOptions` in `vue.config.js`:
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
      output: ''  // default 'yourProjectPath/pul'
    }
  }
}
```

## options

| name | type | des | default | required |
| :--- | :--- | :--- | :--- | :--- |
| entry | Object/Array/String | Vondor entry | null | true 
| open | Binary | Enable DllReferencePlugin  | true | false 
| output | String | chunk and manifest file dir | 'yourProjectPath/public/dll' | false 

## more Expamle
### entry config
入口的配置有两种方式
##### 第一种
> 在vue.config.js的入口定义，但是你必须按照一定的格式来写入口，比如：
``` javascript
module.exports = {
  // Other options...

  entry: {
      // 单入口
      dll: ['vue', 'axios'],
      // 采用有自定义名称的单入口
      dll_vendorName:  ['vue', 'axios'],

      // 支持多入口
      dll_vendorNameOne: ['vue-route'],
      dll_vendorNameTwo: ['vue-vuex'], 
  }
}

```
##### 第二种
> 在 pluginOptions 中的 dll 设置入口
``` javascript

module.exports = {
  // Other options...

  pluginOptions: {
      dll: {
          // 单入口
          entry: ['vue', 'axios'],

          // 支持多入口
          entry: {
            vendorNameOne: ['vue-route'],
            vendorNameTwo: ['vue-vuex'], 
         }
      }
   }
}
```