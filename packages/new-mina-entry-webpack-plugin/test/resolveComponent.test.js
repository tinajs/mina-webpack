const test = require('ava')
const { resolve } = require('path')
const resolveComponent = require('../src/resolveComponent')

const context = resolve(__dirname, 'fixtures')

const resolveComponentHelper = function (request, currentContext) {
  return resolveComponent(context, request, currentContext)
}

const page1Component = {
  name: 'pages/page1/page1',
  extensions: '.mina',
  configPath: resolve(context, 'pages/page1/page1.mina'),
  isModule: false
}

const page2Component = {
  name: 'pages/page2/page2',
  extensions: ['.js', '.json'],
  configPath: resolve(context, 'pages/page2/page2.json'),
  isModule: false
}

const page3Component = {
  name: 'pages/page3/page3',
  extensions: ['.js'],
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

test('resolve splited files component, which config file is null', t => {
  t.deepEqual(resolveComponentHelper('pages/page3/page3'), page3Component)
  t.deepEqual(resolveComponentHelper('/pages/page3/page3'), page3Component)
  t.deepEqual(resolveComponentHelper('./pages/page3/page3'), page3Component)
})

test('resolve not existed component', t => {
  t.false(resolveComponentHelper('pages/page4/page4'))
  t.false(resolveComponentHelper('/pages/page4/page4'))
  t.false(resolveComponentHelper('./pages/page4/page4'))
})

test('double up to parent', t => {
  const rootContext = resolve(__dirname, 'fixtures') 
  const request = '../../components/b/b' 
  const currentContext = resolve(rootContext, 'pages/page1')
  const component = resolveComponent(rootContext, request, currentContext)
  t.deepEqual(component, {
    name: 'components/b/b',
    extensions: ['.js', '.json', '.wxml'],
    configPath: '/home/hello/workspace/run27017/mina-webpack/packages/new-mina-entry-webpack-plugin/test/fixtures/components/b/b.json',
    isModule: false
  })
})

test('resolve a mina module component', t => {
  const localComponent = {
    name: 'local-component-one/index',
    extensions: '.mina',
    configPath: resolve(__dirname, '../vendor/local-component-one/index.mina'),
    isModule: true
  }
  t.deepEqual(resolveComponentHelper('local-component-one/index'), localComponent)
  t.deepEqual(resolveComponentHelper('~local-component-one/index.mina'), localComponent)
})

test('resolve a splited module component', t => {
  const localComponent = {
    name: 'local-component-two/index',
    extensions: ['.js', '.json', '.wxml'],
    configPath: resolve(__dirname, '../vendor/local-component-two/index.json'),
    isModule: true
  }
  t.deepEqual(resolveComponentHelper('local-component-two/index'), localComponent)
  t.deepEqual(resolveComponentHelper('~local-component-two/index'), localComponent)
})
