import path from 'path'
import test from 'ava'
import MinaEntryPlugin from '@tinajs/mina-entry-webpack-plugin'
import compiler from './helpers/compiler'

const resolveRelative = path.resolve.bind(null, __dirname)

test('basic usage with MinaEntryPlugin', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/basic'),
    entry: './app.mina',
    output: {
      filename: '[name]',
    },
    plugins: [new MinaEntryPlugin()],
  })
  await compile()

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
    'text.blue {\n  color: #00f;\n  background: url(/assets/logo.7bd732.png);\n}'
  )
  t.deepEqual(JSON.parse(mfs.readFileSync('/page.json', 'utf8')), {
    name: 'mina',
    usingComponents: { github: '_/extra-resources/github' },
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

test('entry could be defined as requests with custom loaders', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/entry'),
    entry: {
      'app-basic.js': `${require.resolve(
        './helpers/loaders/nothing-loader'
      )}!./app-basic.mina`,
    },
    output: {
      filename: '[name]',
    },
  })
  const stats = await compile()

  t.deepEqual(stats.compilation.errors, [], stats.compilation.errors[0])

  t.true(mfs.existsSync('/app-basic.js'))
  t.true(mfs.existsSync('/app-basic.json'))

  t.pass()
})

test('pages / usingComponents could be defined with non-extname', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/entry'),
    entry: {
      'app-non-extname.js': './app-non-extname.mina',
    },
    output: {
      filename: '[name]',
    },
  })
  const stats = await compile()

  t.deepEqual(stats.compilation.errors, [], stats.compilation.errors[0])

  t.true(mfs.existsSync('/app-non-extname.js'))
  t.true(mfs.existsSync('/app-non-extname.json'))
  t.deepEqual(JSON.parse(mfs.readFileSync('/app-non-extname.json', 'utf8')), {
    pages: ['page-c', 'page-d'],
  })

  t.pass()
})
