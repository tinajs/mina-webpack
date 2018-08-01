const test = require('ava')
const { resolve } = require('path')
const resolveComponent = require('../src/resolveComponent')
const Component = require('../src/Component')

const context = resolve(__dirname, 'fixtures')

const resolveComponentHelper = function (request, currentContext) {
  const component = resolveComponent(context, request, currentContext)
  return component && {
    name: component.request.startsWith('./') ? component.request.slice(2) : component.request,
    main: component.main,
    assets: component.assets,
    configPath: component.configPath,
    isModule: component.isModule
  }
}

const page1Component = {
  name: 'pages/page1/page1',
  main: '.mina',
  assets: [],
  configPath: resolve(context, 'pages/page1/page1.mina'),
  isModule: false
}

const page2Component = {
  name: 'pages/page2/page2',
  main: '.js',
  assets: ['.json'],
  configPath: resolve(context, 'pages/page2/page2.json'),
  isModule: false
}

const page3Component = {
  name: 'pages/page3/page3',
  main: '.js',
  assets: [],
  configPath: null,
  isModule: false
}

test('resolve single file component', t => {
  t.deepEqual(resolveComponentHelper('pages/page1/page1'), page1Component)
  t.deepEqual(resolveComponentHelper('/pages/page1/page1'), page1Component)
  t.deepEqual(resolveComponentHelper('./pages/page1/page1'), page1Component)
})

test('resolve single file component with mina extension', t => {
  t.deepEqual(resolveComponentHelper('pages/page1/page1.mina'), page1Component)
  t.deepEqual(resolveComponentHelper('/pages/page1/page1.mina'), page1Component)
  t.deepEqual(resolveComponentHelper('./pages/page1/page1.mina'), page1Component)
})

test('resolve single file component with current context', t => {
  const page1Context = resolve(context, 'pages/page1')
  const page2Context = resolve(context, 'pages/page2')
  t.deepEqual(resolveComponentHelper('page1', page1Context), page1Component)
  t.deepEqual(resolveComponentHelper('./page1', page1Context), page1Component)
  t.deepEqual(resolveComponentHelper('../page1/page1', page2Context), page1Component)
})

test('resolve splited files component', t => {
  t.deepEqual(resolveComponentHelper('pages/page2/page2'), page2Component)
  t.deepEqual(resolveComponentHelper('/pages/page2/page2'), page2Component)
  t.deepEqual(resolveComponentHelper('./pages/page2/page2'), page2Component)
})

test('resolve splited files componnet with js extension', t => {
  t.deepEqual(resolveComponentHelper('pages/page2/page2.js'), page2Component)
  t.deepEqual(resolveComponentHelper('/pages/page2/page2.js'), page2Component)
  t.deepEqual(resolveComponentHelper('./pages/page2/page2.js'), page2Component)
})

test('resolve splited files component, which config file is null', t => {
  t.deepEqual(resolveComponentHelper('pages/page3/page3'), page3Component)
  t.deepEqual(resolveComponentHelper('/pages/page3/page3'), page3Component)
  t.deepEqual(resolveComponentHelper('./pages/page3/page3'), page3Component)
})

test('resolve not existed component', t => {
  t.false(resolveComponentHelper('pages/notExisted'))
  t.false(resolveComponentHelper('/pages/notExisted'))
  t.false(resolveComponentHelper('./pages/notExisted'))
})

test('double up to parent', t => {
  const rootContext = resolve(__dirname, 'fixtures') 
  const request = '../../components/b/b' 
  const currentContext = resolve(rootContext, 'pages/page1')
  const component = resolveComponent(rootContext, request, currentContext)
  t.deepEqual(component, new Component({
    context: rootContext,
    request: './components/b/b',
    main: '.js',
    assets: ['.json', '.wxml'],
    fullPath: '/home/hello/workspace/run27017/mina-webpack/packages/new-mina-entry-webpack-plugin/test/fixtures/components/b/b'
  }))
})

test('resolve a mina module component', t => {
  const localComponent = {
    name: 'local-component-one/index',
    main: '.mina',
    assets: [],
    configPath: resolve(__dirname, '../vendor/local-component-one/index.mina'),
    isModule: true
  }
  t.deepEqual(resolveComponentHelper('local-component-one/index'), localComponent)
  t.deepEqual(resolveComponentHelper('~local-component-one/index.mina'), localComponent)
})

test('resolve a splited module component', t => {
  const localComponent = {
    name: 'local-component-two/index',
    main: '.js',
    assets: ['.json', '.wxml'],
    configPath: resolve(__dirname, '../vendor/local-component-two/index.json'),
    isModule: true
  }
  t.deepEqual(resolveComponentHelper('local-component-two/index'), localComponent)
  t.deepEqual(resolveComponentHelper('local-component-two/index.js'), localComponent)
  t.deepEqual(resolveComponentHelper('~local-component-two/index'), localComponent)
})
