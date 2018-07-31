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
  configPath: resolve(context, 'pages/page1/page1.mina')
}

const page2Component = {
  name: 'pages/page2/page2',
  extensions: ['.js', '.json'],
  configPath: resolve(context, 'pages/page2/page2.json')
}

const page3Component = {
  name: 'pages/page3/page3',
  extensions: ['.js'],
  configPath: null
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
