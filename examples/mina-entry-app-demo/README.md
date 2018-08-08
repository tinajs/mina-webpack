# tina-app

> 这是一个使用修改后的MinaEntryPlugin的示例项目

为了该项目的跑通，需要到`../../packages/new-mina-entry-webpack-plugin/`目录下执行`npm install`.

在pages/home.mina中测试了四种形式的引入：

1. 引入src目录中的components/author.mina单文件组件
2. 引入src目录中的components/baby1/baby1.[js|json|wxml|wxss]多文件组件
3. 引入vendor目录中的baby2/baby2.mina单文件组件
4. 引入vendor目录中的baby3/baby3.[js|json|wxml|wxss]多文件组件
5. **引入node_modules中的单文件组件（tina-logo.mina组件）**
6. **引入node_modules中的多文件组件（iview的button组件）**

其中src是代码的上下文目录，vendor是本地的node_modules目录，在package.json中有两项依赖：

    "baby2": "file:vendor/baby2",
    "baby3": "file:vendor/baby3"

## License
MIT &copy;
