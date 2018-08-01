# mina-entry-webpack-plugin

> 基于tina小程序框架的webpack插件

这是一个新版，原版的参考../mina-entry-webpack-plugin. 原版的插件能够实现mina文件的引入，但不能引入原生的小程序组件（.js, .json, .wxml, .wxss四文件）。该修改版在保留引入mina组件的基础上，着力于解决原生小程序组件的引入能力。代码的实现主要参考了mina-entry-webpack-plugin和wxapp-webpack-plugin，望知悉。

## 实现的快照

实现的思路是通过插件在合适的时机添加entry，添加的entry主要结构是：

    {
        'app': './app.mina',
        'pages/page1/page1': './pages/page1/page1.mina',
        'pages/page2/page2': './pages/page2/page2.js',
        'pages/page3/page3': './pages/page3/page3.js',
        'components/a/a': './components/a/a.mina',
        'components/b/b': './components/b/b.js',
        'components/e/e': './components/e/e.js',
        'pages/page1/c': './pages/page1/c.mina',
        'pages/page2/c': './pages/page2/c.mina',
        '_/vendor/local-component-one/index': 'local-component-one/index.mina',
        '_/vendor/local-component-two/index': 'local-component-two/index.js',
        '__assetc_chunk_name__': [
            './components/b/b.json',
            './components/b/b.wxml',
            './pages/page2/page2.json',
            'local-component-two/index.json',
            'local-component-two/index.wxml'
        ]
    }

其中最后两条是本地安装的node_modules模块，这里是vendor目录，因为使用的是`npm install --save file:vendor/local-component-one`。如果是直接安装在node_modules中去的，则键名会是`_/node_modules/...`. 

## 新增的能力

### 引入src中的mina组件和原生组件

引入src目录中的组件：

    {
        usingComponents: {
            "a": "/components/a.mina",
            "a": "/components/a"
        }
    }

以上方法都可以成功解析出`components/a`的入口，该项新增主要是可以去掉.mina后缀。

同时支持相对路径的模式：

    {
        usingComponents: {
            "a": "../components/a.mina",
            "a": "./components/a",
            "a": "components/a"
        }
    }

最重要的，支持引入原生小程序组件：

    {
        usingComponents: {
            "b": "/components/b.js",
            "b": "/components/b",
        }
    }

引入的时候可以包括`.js`后缀或不包括`.js`后缀，该引入会引入下面的四个文件（若有）：

- './components/b.js'
- './components/b.json'
- './components/b.wxml'
- './components/b.wxss'

### 引入node_modules中的mina组件和原生组件

node_modules中的组件可以引入：

    {
        usingComponents: {
            "c": "c/dist/button.mina",
            "c": "c/dist/button.js",
            "c": "c/dist/button"
        }
    }

或者添加`~`符号（与mina-loader做兼容）：

    {
        usingComponents: {
            "c": "~c/dist/button.mina",
            "c": "~c/dist/button.js",
            "c": "~c/dist/button"
        }
    }

这时候解析出的结果是：

    {
        '_/node_modules/c/dist/button': 'c/dist/button.js'
        '__assets_chunk_name__': [
            'c/dist/button.json',
            'c/dist/button.wxml',
            'c/dist/button.wxss'
        ]
    }

当发现是mina组件时，只会是：

    {
        '_/node_modules/c/dist/button': 'c/dist/button.mina'
    }

这样，会让js文件生成到`dist/_/node_modules/c/dist/button.js`，而通过合理地配置file-loader，json, wxml, wxss文件也会生成到同样的目录。

写法上，`c/dist/button`既能解析node_modules中的组件，也能解析相对路径上的组件。当两者都能够成功解析时，node_modules中的优先，这时需要明确的写法，如`./c/dist/button`.

## 缺失的能力

当我写到最后，才发现原版的plugin结合mina-loader实现了更多的功能，这些还未考虑进来。包括：

1. 小程序插件（小程序插件这块的文档我暂时还未阅读，故而不太熟悉）
2. 引入组件包（如@tina/tina-logo这样的npm组件包）

关于第2点，我个人认为新版插件是可以做到引入mina组件包的，但由于与mina-loader不兼容，导致看不到引入的效果。这一部分待会在兼容性章节中进一步说明。

## 与mina-loader的兼容性

首先，兼容性较严重的一点是引入node_modules中的模块。无论是引入mina组件还是原生组件，其生成的文件会进入到`dist/_/_node_modules_`目录中去，而不是我的插件计算出来的`dist/_/node_modules`. 而后者能够与file-loader更好地结合。

第二点，mina-loader会读取usingComponents和pages配置中的路径，这使得在写法上必须加上后缀，如`/components/a.mina`和`/components/a.js`. 虽然我的插件能够很好地处理不加后缀的形式，而且也是我较为推荐的写法，但在mina-loader读取的时候会报错。

第三点，针对node_modules模块，则必须加上前缀`~`，原因同样是mina-loader会尝试去读取这个地址，但它并不知道应该去node_modules中去读，只有明确地加上`~`前缀才会识别。前缀方式我其实并不推荐，有时候还会与别名混淆，但别名是明确地不支持的。

所以，要完整地利用新版插件以及更好地测试它，mina-loader中的若干机制确实需要修改。最重要的修改的地方，是生成到`dist/_/_node_modules_`中的默认假定。

## 希望与大家讨论的地方

由于时间的关系，我并不打算在完整完成之后才提交我的pull request，而是尽快地提交更早地讨论。关于mina-loader的地方，如果时间充裕，我会在若干天之后改动它。当然，作者自己早日修改它更好啦。

即使不修改mina-loader，目前的mina-entry结合现有的mina-entry也是可以很好地工作的，绝对不是一个玩具产品。除了以下两项功能无法实现之外：

1. 小程序plugins的缺失，这点我应该在不久之后补齐。主要是平时开发中还没有接触到plugin的内容。
2. 不能引入node_modules中的模块，这一点的替代方法是很多的。例如可以考虑将组件的源代码放到src目录中。或者放在一个公共目录（如vendor），然后使用`npm install --save file:vendor/..`的方式安装。

## 关于我的理解

原版的插件能够很好地处理单文件的模式，即mina文件，在纯mina生态下工作得很好。但不能引入原生的小程序组件。但原生组件才是更广阔的市场，需要有兼容并包的心态将这些组件无缝地纳入进来才更好。
