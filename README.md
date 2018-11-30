
# vue-cli-plugin-dll [![vue-cli3](https://img.shields.io/badge/vue--cli-3.x-brightgreen.svg)](https://github.com/vuejs/vue-cli)
Vue CLI 3 plugin for Dll and DllReference



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
> config entry in vue.config.js, but you have to configure it in the prescribed format.
``` javascript
module.exports = {
  // Other options...

  entry: {
      // Single entry
      dll: ['vue', 'axios'],
      // or
      dll_vendorName: ['vue', 'axios'],

      // Multiple entry
      dll_vendorNameOne: ['vue-route'],
      dll_vendorNameTwo: ['vue-vuex'], 
  }
}

```
> the entry also can be configured via the pluginOptions in vue.config.js
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