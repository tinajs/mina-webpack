import path from 'path'
import test from 'ava'
import compiler from './helpers/compiler'

const resolveRelative = path.resolve.bind(null, __dirname)

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
    '<view>\n  <text class="blue">{{msg}}</text>\n  <image src="/assets/logo.7bd732.png" />\n</view>'
  )
  t.is(
    mfs.readFileSync('/fixtures/basic/page.wxss', 'utf8'),
    'text.blue {\n  color: #00f;\n  background: url(/assets/logo.7bd732.png);\n}'
  )
  t.is(
    mfs.readFileSync('/fixtures/basic/page.json', 'utf8'),
    '{\n  "name": "mina"\n}'
  )

  t.pass()
})

test('pack multiple files', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/basic'),
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
  t.true(
    mfs.readFileSync('/page.js', 'utf8').includes("console.log('\\u2665')")
  )
  t.is(
    mfs.readFileSync('/page.wxml', 'utf8'),
    '<view>\n  <text class="blue">{{msg}}</text>\n  <image src="/assets/logo.7bd732.png" />\n</view>'
  )
  t.is(
    mfs.readFileSync('/page.wxss', 'utf8'),
    'text.blue {\n  color: #00f;\n  background: url(/assets/logo.7bd732.png);\n}'
  )
  t.is(mfs.readFileSync('/page.json', 'utf8'), '{\n  "name": "mina"\n}')

  t.true(mfs.readFileSync('/app.js', 'utf8').includes('onLaunch () {'))
  t.true(mfs.readFileSync('/app.js', 'utf8').includes('Hello from App!'))
  t.true(mfs.readFileSync('/app.js', 'utf8').includes("console.log('\\u2665')"))
  t.false(
    mfs.existsSync('/app.wxml', 'utf8'),
    '<view>\n  <text class="blue">{{msg}}</text>\n  <image src="/assets/logo.7bd732.png" />\n</view>'
  )
  t.false(
    mfs.existsSync('/app.wxss', 'utf8'),
    'text.blue {\n  color: #00f;\n  background: url(/assets/logo.7bd732.png);\n}'
  )
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
    '<view>\n  <text class="blue">{{msg}}</text>\n  <image src="/assets/logo.7bd732.png" />\n</view>'
  )
  t.is(
    mfs.readFileSync('/fixtures/basic/page.wxss', 'utf8'),
    'text.blue {\n  color: #00f;\n  background: url(/assets/logo.7bd732.png);\n}'
  )
  t.is(
    mfs.readFileSync('/fixtures/basic/page.json', 'utf8'),
    '{\n  "name": "mina"\n}'
  )

  t.pass()
})
