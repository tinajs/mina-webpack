import path from 'path'
import test from 'ava'
import MinaEntryPlugin from '@tinajs/mina-entry-webpack-plugin'
import compiler from './helpers/compiler'

const resolveRelative = path.resolve.bind(null, __dirname)

test('resolve components', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/resolve-components/src'),
    entry: 'app.mina',
    output: {
      filename: 'app.js',
    },
    plugins: [new MinaEntryPlugin()],
  })

  await compile()

  t.deepEqual(JSON.parse(mfs.readFileSync('/pages/home.json', 'utf-8')), {
    usingComponents: {
      a: './../components/a',
      b: './../components/b',
      c: './c',
      d: './d',
      logo: './../_/_node_modules_/logo.mina/dist/logo',
      tab: './../_/_node_modules_/tab/tab',
      'mp-badge': 'weui-miniprogram/badge/badge',
      plugin: 'plugin://foobar/component',
      dynamicLib: 'dynamicLib://swan-sitemap-lib/component',
    },
  })

  t.deepEqual(
    JSON.parse(mfs.readFileSync('/_/_node_modules_/tab/tab.json', 'utf-8')),
    {
      component: true,
      usingComponents: {
        logo: './../logo.mina/dist/logo',
        'tab-item': './tab-item',
      },
    }
  )

  t.pass()
})
