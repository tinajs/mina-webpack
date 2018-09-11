const td = require('testdouble')
const resolveFrom = td.replace('resolve-from')
const fs = td.replace('fs')

const test = require('ava')
const { resolve } = require('path')
const resolveComponent = require('../src/resolveComponent')
const Component = require('../src/Component')

const context = resolve(__dirname, 'fixtures')

test('resolve a mina file in src', t => {
  td.when(fs.existsSync(resolve(context, 'components/a.mina'))).thenReturn(true)

  const component = new Component({
    context,
    request: './components/a.mina',
    fullPath: resolve(context, './components/a.mina'),
    assets: []
  })

  t.deepEqual(resolveComponent(context, 'components/a.mina'), component)
  t.deepEqual(resolveComponent(context, '/components/a.mina'), component)
  t.deepEqual(resolveComponent(context, './components/a.mina'), component)
  t.deepEqual(resolveComponent(context, 'components/a'), component)
  t.deepEqual(resolveComponent(context, '/components/a'), component)
  t.deepEqual(resolveComponent(context, './components/a'), component)
})

test('resolve a js file in src', t => {
  td.when(fs.existsSync(resolve(context, 'components/b.js'))).thenReturn(true)
  td.when(fs.existsSync(resolve(context, 'components/b.json'))).thenReturn(true)
  td.when(fs.existsSync(resolve(context, 'components/b.wxml'))).thenReturn(true)

  const component = new Component({
    context,
    request: './components/b.js',
    fullPath: resolve(context, 'components/b.js'),
    assets: [
      resolve(context, 'components/b.json'),
      resolve(context, 'components/b.wxml')
    ]
  })

  t.deepEqual(resolveComponent(context, 'components/b.js'), component)
  t.deepEqual(resolveComponent(context, '/components/b.js'), component)
  t.deepEqual(resolveComponent(context, './components/b.js'), component)
  t.deepEqual(resolveComponent(context, 'components/b'), component)
  t.deepEqual(resolveComponent(context, '/components/b'), component)
  t.deepEqual(resolveComponent(context, './components/b'), component)
})

test('resolve a mina file in node_modules', t => {
  td.when(resolveFrom(context, 'component-one/dist/index.mina'))
    .thenReturn(resolve(context, '../node_modules/component-one/dist/index.mina'))

  const component = new Component({
    context,
    request: 'component-one/dist/index.mina',
    fullPath: resolve(context, '../node_modules/component-one/dist/index.mina'),
    assets: []
  })

  t.deepEqual(resolveComponent(context, '~component-one/dist/index.mina'), component)
  t.deepEqual(resolveComponent(context, '~component-one/dist/index'), component)
})

test('resolve a js file in node_modules', t => {
  td.when(resolveFrom(context, 'component-two/dist/index.js'))
    .thenReturn(resolve(context, '../node_modules/component-two/dist/index.js'))
  td.when(fs.existsSync(resolve(context, '../node_modules/component-two/dist/index.js'))).thenReturn(true)
  td.when(fs.existsSync(resolve(context, '../node_modules/component-two/dist/index.json'))).thenReturn(true)
  td.when(fs.existsSync(resolve(context, '../node_modules/component-two/dist/index.wxml'))).thenReturn(true)

  const component = new Component({
    context,
    request: 'component-two/dist/index.js',
    fullPath: resolve(context, '../node_modules/component-two/dist/index.js'),
    assets: [
      resolve(context, '../node_modules/component-two/dist/index.json'),
      resolve(context, '../node_modules/component-two/dist/index.wxml')
    ]
  })

  t.deepEqual(resolveComponent(context, '~component-two/dist/index.js'), component)
  t.deepEqual(resolveComponent(context, '~component-two/dist/index'), component)
})

test('resolve a mina module in node_modules', t => {
  td.when(resolveFrom(context, 'component-three'))
    .thenReturn(resolve(context, '../node_modules/component-three/dist/index.mina'))

  const component = new Component({
    context,
    request: 'component-three',
    fullPath: resolve(context, '../node_modules/component-three/dist/index.mina'),
    assets: []
  })

  t.deepEqual(resolveComponent(context, '~component-three'), component)
})
