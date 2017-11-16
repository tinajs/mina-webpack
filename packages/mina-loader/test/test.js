import test from 'ava'
import { expect } from 'chai'
import compiler from './helpers/compiler'

test('basic', async (t) => {
  try {
    const { compile, mfs } = compiler({
      entry: './fixtures/page.mina',
      output: {
        filename: 'fixtures/page.js',
      },
    })
    const stats = await compile()

    // console.log(mfs.readFileSync('/fixtures/page.js', 'utf8'))
    // console.log(mfs.data)

    t.true(mfs.existsSync('/assets/logo.7bd732.png'))

    t.true(mfs.readFileSync('/fixtures/page.js', 'utf8').includes('onLoad () {'))
    t.true(mfs.readFileSync('/fixtures/page.js', 'utf8').includes('Hello from Page!'))
    t.true(mfs.readFileSync('/fixtures/page.js', 'utf8').includes('console.log(\'\\u2665\')'))
    t.is(mfs.readFileSync('/fixtures/page.wxml', 'utf8'), '\n<view>\n  <text class="blue">{{msg}}</text>\n  <image src="assets/logo.7bd732.png" />\n</view>\n')
    t.is(mfs.readFileSync('/fixtures/page.wxss', 'utf8'), '\ntext.blue {\n  color: #00f;\n  background: url(assets/logo.7bd732.png);\n}\n')
    t.is(mfs.readFileSync('/fixtures/page.json', 'utf8'), '{\n  "name": "mina"\n}')

    t.pass()
  } catch (error) {
    console.log(error)
  }
})

test('pack multiple files', async (t) => {
  try {
    const { compile, mfs } = compiler({
      entry: {
        'fixtures/page.js': './fixtures/page.mina',
        'fixtures/app.js': './fixtures/app.mina',
      },
      output: {
        filename: '[name]',
      },
    })
    const stats = await compile()

    t.true(mfs.existsSync('/assets/logo.7bd732.png'))

    t.true(mfs.readFileSync('/fixtures/page.js', 'utf8').includes('onLoad () {'))
    t.true(mfs.readFileSync('/fixtures/page.js', 'utf8').includes('Hello from Page!'))
    t.true(mfs.readFileSync('/fixtures/page.js', 'utf8').includes('console.log(\'\\u2665\')'))
    t.is(mfs.readFileSync('/fixtures/page.wxml', 'utf8'), '\n<view>\n  <text class="blue">{{msg}}</text>\n  <image src="assets/logo.7bd732.png" />\n</view>\n')
    t.is(mfs.readFileSync('/fixtures/page.wxss', 'utf8'), '\ntext.blue {\n  color: #00f;\n  background: url(assets/logo.7bd732.png);\n}\n')
    t.is(mfs.readFileSync('/fixtures/page.json', 'utf8'), '{\n  "name": "mina"\n}')

    t.true(mfs.readFileSync('/fixtures/app.js', 'utf8').includes('onLaunch () {'))
    t.true(mfs.readFileSync('/fixtures/app.js', 'utf8').includes('Hello from App!'))
    t.true(mfs.readFileSync('/fixtures/app.js', 'utf8').includes('console.log(\'\\u2665\')'))
    t.false(mfs.existsSync('/fixtures/app.wxml', 'utf8'), '\n<view>\n  <text class="blue">{{msg}}</text>\n  <image src="assets/logo.7bd732.png" />\n</view>\n')
    t.false(mfs.existsSync('/fixtures/app.wxss', 'utf8'), '\ntext.blue {\n  color: #00f;\n  background: url(assets/logo.7bd732.png);\n}\n')
    t.is(mfs.readFileSync('/fixtures/app.json', 'utf8'), '{\n  "pages": [\n    "page"\n  ]\n}')

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
                  js: 'babel-loader',
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
    t.is(mfs.readFileSync('/fixtures/page.wxml', 'utf8'), '\n<view>\n  <text class="blue">{{msg}}</text>\n  <image src="assets/logo.7bd732.png" />\n</view>\n')
    t.is(mfs.readFileSync('/fixtures/page.wxss', 'utf8'), '\ntext.blue {\n  color: #00f;\n  background: url(assets/logo.7bd732.png);\n}\n')
    t.is(mfs.readFileSync('/fixtures/page.json', 'utf8'), '{\n  "name": "mina"\n}')

    t.pass()
  } catch (error) {
    console.log(error)
  }
})
