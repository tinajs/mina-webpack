import path from 'path'
import test from 'ava'
import MinaEntryPlugin from '../../mina-entry-webpack-plugin'
import compiler from './helpers/compiler'

const resolveRelative = path.resolve.bind(null, __dirname)

test('resolve components', async (t) => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/resolve-components'),
    entry: 'app.mina',
    output: {
      filename: 'app.js',
    },
    plugins: [
      new MinaEntryPlugin(),
    ],
  })

  await compile()
  t.deepEqual(JSON.parse(mfs.readFileSync('/pages/home.json', 'utf-8')), {
    "usingComponents": {
      "a": "../components/a",
      "b": "../components/b",
      "c": "../pages/c"
    }
  })
  t.pass()
})
