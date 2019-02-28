
# vue-cli-plugin-dll [![vue-cli3](https://img.shields.io/badge/vue--cli-3.x-brightgreen.svg)](https://github.com/vuejs/vue-cli) ![npm](https://img.shields.io/npm/dm/vue-cli-plugin-dll.svg) [![npm](https://img.shields.io/npm/v/vue-cli-plugin-dll.svg)](https://www.npmjs.com/package/vue-cli-plugin-dll)

Vue CLI 3 plugin for Dll and DllReference
## 起步

> 确保你安装的是 vue-cli 3.x.x 版本
```
$ vue -V
```

### 安装
``` bash
$ vue add dll 

# OR 

$vue invoke dll
```


### 快速开始
> 最方便的配置

#### 你可以在`vue.config.js` 文件中的pluginOptions中定义一个dll参数对象。
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

### 生成Dll文件

```bash
$ npm run dll

#OR

$ npx vue-cli-service dll
```

## 配置参数
> vue.config.js:
``` javascript
module.exports = {
  // Other options...

  pluginOptions: {
     dll: {
       // 入口配置
      entry: ['vue'],
      // 输入目录
      output: path.join(__dirname, './public/dll'),

      // 是否开启 DllReferencePlugin,
      // 如果你需要在默写环境中不采用开启分包模式，你可以配置open为false。
      // 例如，我们入口配置为 entry: ['vue']， 我们执行npm run dll 构建了vendor包。
      // 在npm run serve的时候，如果默认open开启的情况下，其实开发环境采用的vue是生成环境的包，因为我们dll命令构建的就是生成环境的包。
      // 这会让我们在开发环境中无法看到vue给我们带来的友好提示建议。
      // 我们可以配置open : process.env.NODE_ENV === 'production'，只在生成环境开启DllReferencePlugin
      open: 'auto',

      // 自动注入到index.html
      // 在构建其他命令的时候，如果开启了自动注入。程序会手动将output中生成的*.dll.js 文件自动注入到index.html中。
      inject: true,
    }
  }
}
```

## options

| 参数 | 类型/值集 | 描述| 默认值 | 是否必填 |
| :--- | :--- | :--- | :--- | :--- |
| entry | Object/Array/String | 入口配置 | null | true 
| open | true/false/'auto' | 启用 DllReferencePlugin  | 'auto' | false 
| output | Object | 打包输出配置 |  | false 
| output.path | String | 打包后chunk和manifest.json存放的目录 | 'yourProjectPath/public/dll' | false 
| inject | Boolean | 自动将打包的vendor注入到index.html | true |  false
| cacheFilePath | String | 将打包后的所有资源路径保存到一个文件(绝对目录路径) | 'yourProjectPath/node_modules/vue-cli-plugin-dll/src' |  false




## 更多示例
### entry config
``` javascript
module.exports = {
  // Other options...

  pluginOptions: {
      dll: {
           // 单入口
          entry: ['vue', 'axios'],

          // 多入口
          entry: {
            vendorNameOne: ['vue-route'],
            vendorNameTwo: ['vue-vuex'], 
         }
      }
   }
}
```

### open config
> 增加 webpack.DllReferencePlugin 插件
``` javascript
module.exports = {
  // Other options...

  pluginOptions: {
      dll: {
          entry: ['vue'],
          // 只在生产环境加入 webpack.DllReferencePlugin 插件
          open: process.env.NODE_ENV === 'production',      
      }
   }
}
```
### inject config
>  是否自动将执行dll命令执行打包的vendor包自动注入到index.html中去
``` javascript
module.exports = {
  // Other options...

  pluginOptions: {
      dll: {
        entry: ['vue'],
        // 如果你手动的在index.html 中引用了 打包完成后的vendor, 你可以关闭注入。
        inject: false
      }
   }
}
```

### output config
>  打包vendor文件输出配置
``` javascript
module.exports = {
  // Other options...

  pluginOptions: {
      dll: {
        entry: ['vue'],
        // 可以打包完的vendor文件放到指定的位置
        output: path.resolve(__dirname, './public/newDllDir')

        // or
        output: {
          path: path.resolve(__dirname, './public/newDllDir')
        }
      }
   }
}
```


### cacheFilePath config

在了解这个配置之前，先简单了解一下v`ue-cli-plugin-dll`的vendor文件获取机制，在获取vendor文件的时候有两种方式实现。
1. 在生成vendor文件的时候将所有文件路径以文件（cache.dll.json）的方式存储起来，在自动注入的时候去获取，这样能准确获取最新一次打包完成的所有文件路径。
2. 通过入口名模糊匹配到文件手动注入。这种方式有很大的不可确定因素，可能导致多余文件的匹配从而引用混乱。
所以建议采用第一种方式（默认方式）进行，第二种方式只是作为备选方案。

在第一种方式的实现上，`vue-cli-plugin-dll`插件默认将文件存储在 `vue-cli-plugin-dll`的src目录下，这种情况会导致两个问题
1. 在线上部署机器中不存在缓存文件导致构建出现问题，
2. 在升级插件包的时候缓存丢失导致构建出现问题。
   
了解了手动注入的文件获取机制后，为了解决此项问题，我们加入了`cache.dll.json`文件目录路径的配置，该配置可以将`npm run dll`生成的`cache.dll.json`存放在指定位置，从而避免以上问题
``` javascript
module.exports = {
  // Other options...

  pluginOptions: {
      dll: {
        entry: ['vue'],
        // 目录的绝对路径
        cacheFilePath: path.resolve(__dirname, './public')
      }
   }
}
```



### 按需加载
由于预打包机制跟主打包机制是完全分割的，所以我们只能采用另外一种方式进行模拟按需打包
>> 在这个例子中，以elemnent-ui为例子，做按需加载部分组件。
新建一个element.js文件在项目中（此例子将element.js和main.js入口文件同级）
```
// 引入css
import 'element-ui/lib/theme-chalk/index.css'
// 你需要在这里加载你需要用到的组件
import  {Input} from 'element-ui'

const element = {

  install: function (Vue) {
    Vue.component(Input.name, Input)
  }
}
export default elemen
```
然后在vue.config.js中加上配置
```
// vue.config.js
module.exports = {
  // 其他配置..

  pluginOptions: {
    dll: {
      entry: {
        // 你新加的element.js文件路径
        index: ['./src/element.js'],
      }
    }
  },
} 
```
在你的入口文件(main.js)引入这个文件并且注册， eg:
```
import element from './element.js'
Vue.use(element)
```
然后执行： npn run dll

注意点：

1. 在使用这个分包之前，你要确定好你已经按照elementUI做好按需加载的步骤，配置好babel-plugin-component
2. 每一次有element.js有改动，需要重新打包一次最新的。执行命令 npm run dll





