import path from 'path'
import test from 'ava'
import { expect } from 'chai'
import compiler from './helpers/compiler'

const resolveRelative = path.resolve.bind(null, __dirname)

test('basic', async (t) => {
  try {
    const { compile, mfs } = compiler({
      entry: './fixtures/page.mina',
      output: {
        filename: 'fixtures/page.js',
      },
    })
    const stats = await compile()

    // console.log(mfs.readFileSync('/fixtures/page.wxml', 'utf8'))

    // console.log(mfs.readFileSync('/fixtures/page.js', 'utf8'))
    // console.log(mfs.data)

    t.true(mfs.existsSync('/assets/logo.7bd732.png'))

    t.true(mfs.readFileSync('/fixtures/page.js', 'utf8').includes('onLoad () {'))
    t.true(mfs.readFileSync('/fixtures/page.js', 'utf8').includes('Hello from Page!'))
    t.true(mfs.readFileSync('/fixtures/page.js', 'utf8').includes('console.log(\'\\u2665\')'))
    t.is(mfs.readFileSync('/fixtures/page.wxml', 'utf8'), '<view>\n  <text class="blue">{{msg}}</text>\n  <image src="assets/logo.7bd732.png" />\n</view>')
    t.is(mfs.readFileSync('/fixtures/page.wxss', 'utf8'), 'text.blue {\n  color: #00f;\n  background: url(assets/logo.7bd732.png);\n}')
    t.is(mfs.readFileSync('/fixtures/page.json', 'utf8'), '{\n  "name": "mina"\n}')

    t.pass()
  } catch (error) {
    console.log(error)
  }
})

test('pack multiple files', async (t) => {
  try {
    const { compile, mfs } = compiler({
      context: resolveRelative('fixtures'),
      entry: {
        'page.js': './page.mina',
        'app.js': './app.mina',
      },
      output: {
        filename: '[name]',
      },
    })
    const stats = await compile()

    t.true(mfs.existsSync('/assets/logo.7bd732.png'))

    t.true(mfs.readFileSync('/page.js', 'utf8').includes('onLoad () {'))
    t.true(mfs.readFileSync('/page.js', 'utf8').includes('Hello from Page!'))
    t.true(mfs.readFileSync('/page.js', 'utf8').includes('console.log(\'\\u2665\')'))
    t.is(mfs.readFileSync('/page.wxml', 'utf8'), '<view>\n  <text class="blue">{{msg}}</text>\n  <image src="assets/logo.7bd732.png" />\n</view>')
    t.is(mfs.readFileSync('/page.wxss', 'utf8'), 'text.blue {\n  color: #00f;\n  background: url(assets/logo.7bd732.png);\n}')
    t.is(mfs.readFileSync('/page.json', 'utf8'), '{\n  "name": "mina"\n}')

    t.true(mfs.readFileSync('/app.js', 'utf8').includes('onLaunch () {'))
    t.true(mfs.readFileSync('/app.js', 'utf8').includes('Hello from App!'))
    t.true(mfs.readFileSync('/app.js', 'utf8').includes('console.log(\'\\u2665\')'))
    t.false(mfs.existsSync('/app.wxml', 'utf8'), '<view>\n  <text class="blue">{{msg}}</text>\n  <image src="assets/logo.7bd732.png" />\n</view>')
    t.false(mfs.existsSync('/app.wxss', 'utf8'), 'text.blue {\n  color: #00f;\n  background: url(assets/logo.7bd732.png);\n}')
    t.is(mfs.readFileSync('/app.json', 'utf8'), JSON.stringify({pages: ['page']}, null, '  '))

    t.pass()
  } catch (error) {
    console.log(error)
  }
})

test('pack with options', async (t) => {
  try {
    const { compile, mfs } = compiler({
      entry: './fixtures/page.mina',
      output: {
        filename: 'fixtures/page.js',
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

    t.false(mfs.readFileSync('/fixtures/page.js', 'utf8').includes('onLoad () {'))
    t.true(mfs.readFileSync('/fixtures/page.js', 'utf8').includes('onLoad: function onLoad() {'))
    t.true(mfs.readFileSync('/fixtures/page.js', 'utf8').includes('Hello from Page!'))
    t.true(mfs.readFileSync('/fixtures/page.js', 'utf8').includes('console.log(\'\\u2665\')'))
    t.is(mfs.readFileSync('/fixtures/page.wxml', 'utf8'), '<view>\n  <text class="blue">{{msg}}</text>\n  <image src="assets/logo.7bd732.png" />\n</view>')
    t.is(mfs.readFileSync('/fixtures/page.wxss', 'utf8'), 'text.blue {\n  color: #00f;\n  background: url(assets/logo.7bd732.png);\n}')
    t.is(mfs.readFileSync('/fixtures/page.json', 'utf8'), '{\n  "name": "mina"\n}')

    t.pass()
  } catch (error) {
    console.log(error)
  }
})
