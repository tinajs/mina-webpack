# mina-entry-webpack-plugin

> 修改微信小程序webpack entry的插件，支持mina单文件组件、node_modules组件。

其原理是通过app.mina出发，依次解析依赖，从而得到多个命名入口。其解析的入口格式大致是：

```json
{
    "app.js": "./app.mina",
    "pages/page1.js": "./pages/page1.mina",
    "pages/page2.js": "./pages/page2.js",
    "_/_node_modules_/component-one/dist/index.js": "component-one/dist/index.mina",
    "_/_node_modules_/component-two/dist/index.js": "component-one/dist/index.js",
    "__assets_chunk_name__": [
        "./pages/page2.json",
        "./pages/page2.wxml",
        "component-two/dist/index.json",
        "component-two/dist/index.wxml"
    ]
}
```

配合上合适的loader，如mina-loader、file-loader、change-path-loader等，可以实现小程序的编译效果。

## 支持的引入格式

支持在app.mina文件内引入页面路径，支持在小程序的页面文件和组件文件内引入其他组件路径。路径支持的格式很多样，支持mina单文件组件、支持原生组件（json、js、wxml、wxss）、支持引入node_modules内的组件等。

### 引入其他组件

```json
{
    "usingComponents": {
        "comp-a": "/components/comp-a.mina",
        "comp-b": "../components/comp-b.js",
        "comp-c": "./comp-c",
        "comp-d": "comp-d"
    }
}
```

说明：

1. 引入的时候可以加后缀，也可以不加后缀；
2. 支持绝对路径（`/`）、相对路径（`./`, `../`）；
3. 最后一个组件的引入（`comp-d`）是相对路径的形式，类似于`./comp-d`.

### 引入node_modules组件

node_modules组件的引入要以`~`开头，支持mina单文件组件和原生多文件组件。

```json
{
    "usingComponents": {
        "comp-one": "~comp-one/dist/index",
        "comp-two": "~comp-two/dist/index",
    }
}
```

如果在package.json中的main字段设置合适，则以上组件引入可以简写为：

```json
{
    "usingComponents": {
        "comp-one": "~comp-one",
        "comp-two": "~comp-two",
    }
}
```

node_modules中引入的entry，它的入口名是相对于context的路径名。示例：`_/_node_modules_/component-one/dist/index.js`. 其中`..`会被替换为`_`，`node_modules`
替换为`_node_modules_`，因为小程序会自动忽略名为`node_modules`的文件夹。

该形式的路径只要稍加处理即可以被`file-loader`处理。
