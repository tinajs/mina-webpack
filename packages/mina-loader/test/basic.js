import fs from 'fs'
import path from 'path'
import test from 'ava'
import compiler from './helpers/compiler'

const resolveRelative = path.resolve.bind(null, __dirname)

const logo =
  'image/png;base64,' +
  fs.readFileSync(__dirname + '/fixtures/basic/logo.png.txt', 'utf8').trim()

test('basic', async t => {
  const { compile, mfs } = compiler({
    entry: './fixtures/basic/page.mina',
    output: {
      filename: 'fixtures/basic/page.js',
    },
  })
  const stats = await compile()

  t.true(mfs.existsSync('/assets/logo.7bd732.png'))

  t.true(
    mfs.readFileSync('/fixtures/basic/page.js', 'utf8').includes('onLoad () {')
  )
  t.true(
    mfs
      .readFileSync('/fixtures/basic/page.js', 'utf8')
      .includes('Hello from Page!')
  )
  t.true(
    mfs
      .readFileSync('/fixtures/basic/page.js', 'utf8')
      .includes("console.log('\\u2665')")
  )
  t.is(
    mfs.readFileSync('/fixtures/basic/page.wxml', 'utf8'),
    '<view>\n  <text class="blue">{{msg}}</text>\n  <image src="../../assets/logo.7bd732.png" />\n</view>'
  )
  t.is(
    mfs.readFileSync('/fixtures/basic/page.wxss', 'utf8'),
    `text.blue {\n  color: #00f;\n  background: url(data:${logo});\n}`
  )
  t.deepEqual(
    JSON.parse(mfs.readFileSync('/fixtures/basic/page.json', 'utf8')),
    {
      name: 'mina',
      usingComponents: { github: './../extra-resources/github' },
    }
  )

  t.pass()
})

test('pack multiple files with specified context', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/basic'),
    entry: {
      'page.js': './page.mina',
      'app.js': './app.mina',
      '_/extra-resources/github.js': '../extra-resources/github.mina',
    },
    output: {
      filename: '[name]',
    },
  })
  const stats = await compile()

  t.true(mfs.existsSync('/assets/logo.7bd732.png'))
  t.true(mfs.existsSync('/assets/github.7e4717.png'))

  t.true(mfs.readFileSync('/page.js', 'utf8').includes('onLoad () {'))
  t.true(mfs.readFileSync('/page.js', 'utf8').includes('Hello from Page!'))
  t.true(
    mfs.readFileSync('/page.js', 'utf8').includes("console.log('\\u2665')")
  )
  t.is(
    mfs.readFileSync('/page.wxml', 'utf8'),
    '<view>\n  <text class="blue">{{msg}}</text>\n  <image src="./assets/logo.7bd732.png" />\n</view>'
  )
  t.is(
    mfs.readFileSync('/page.wxss', 'utf8'),
    `text.blue {\n  color: #00f;\n  background: url(data:${logo});\n}`
  )
  t.deepEqual(JSON.parse(mfs.readFileSync('/page.json', 'utf8')), {
    name: 'mina',
    usingComponents: { github: './_/extra-resources/github' },
  })

  t.true(
    mfs
      .readFileSync('/_/extra-resources/github.js', 'utf8')
      .includes('Component({})')
  )
  t.is(
    mfs.readFileSync('/_/extra-resources/github.wxml', 'utf8'),
    '<image src="../../assets/github.7e4717.png" />'
  )
  t.deepEqual(
    JSON.parse(mfs.readFileSync('/_/extra-resources/github.json', 'utf8')),
    { component: true }
  )

  t.true(mfs.readFileSync('/app.js', 'utf8').includes('onLaunch () {'))
  t.true(mfs.readFileSync('/app.js', 'utf8').includes('Hello from App!'))
  t.true(mfs.readFileSync('/app.js', 'utf8').includes("console.log('\\u2665')"))
  t.is(
    mfs.readFileSync('/app.json', 'utf8'),
    JSON.stringify({ pages: ['page'] }, null, '  ')
  )

  t.pass()
})

test('pack with options', async t => {
  const { compile, mfs } = compiler({
    entry: './fixtures/basic/page.mina',
    output: {
      filename: 'fixtures/basic/page.js',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
            options: {
              loaders: {
                script: 'babel-loader',
              },
            },
          },
        },
      ],
    },
  })
  const stats = await compile()

  t.true(mfs.existsSync('/assets/logo.7bd732.png'))

  t.false(
    mfs.readFileSync('/fixtures/basic/page.js', 'utf8').includes('onLoad () {')
  )
  t.true(
    mfs
      .readFileSync('/fixtures/basic/page.js', 'utf8')
      .includes('onLoad: function onLoad() {')
  )
  t.true(
    mfs
      .readFileSync('/fixtures/basic/page.js', 'utf8')
      .includes('Hello from Page!')
  )
  t.true(
    mfs
      .readFileSync('/fixtures/basic/page.js', 'utf8')
      .includes("console.log('\\u2665')")
  )
  t.is(
    mfs.readFileSync('/fixtures/basic/page.wxml', 'utf8'),
    '<view>\n  <text class="blue">{{msg}}</text>\n  <image src="../../assets/logo.7bd732.png" />\n</view>'
  )
  t.is(
    mfs.readFileSync('/fixtures/basic/page.wxss', 'utf8'),
    `text.blue {\n  color: #00f;\n  background: url(data:${logo});\n}`
  )
  t.deepEqual(
    JSON.parse(mfs.readFileSync('/fixtures/basic/page.json', 'utf8')),
    {
      name: 'mina',
      usingComponents: { github: './../extra-resources/github' },
    }
  )

  t.pass()
})

test('handle cloud-url in template', async t => {
  const { compile, mfs } = compiler({
    entry: './fixtures/basic/cloud-url.mina',
    output: {
      filename: 'fixtures/basic/cloud-url.js',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
            options: {
              loaders: {
                script: 'babel-loader',
              },
            },
          },
        },
      ],
    },
  })
  const stats = await compile()
  t.is(
    mfs.readFileSync('/fixtures/basic/cloud-url.wxml', 'utf8'),
    '<image src="cloud://foobar.test/logo.png" />'
  )

  t.pass()
})

test('empty mina file should emit files with default content', async t => {
  const { compile, mfs } = compiler({
    entry: './fixtures/basic/empty.mina',
    output: {
      filename: 'fixtures/basic/empty.js',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
          },
        },
      ],
    },
  })
  const stats = await compile()
  t.is(mfs.readFileSync('/fixtures/basic/empty.wxml', 'utf8'), '')
  t.is(mfs.readFileSync('/fixtures/basic/empty.wxss', 'utf8'), '')
  t.is(mfs.readFileSync('/fixtures/basic/empty.json', 'utf8'), '{}')
  t.true(mfs.existsSync('/fixtures/basic/empty.js'))

  t.pass()
})
