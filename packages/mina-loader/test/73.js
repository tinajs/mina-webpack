import path from 'path'
import test from 'ava'
import compiler from './helpers/compiler'
import MinaEntryPlugin from '../../mina-entry-webpack-plugin'

const resolveRelative = path.resolve.bind(null, __dirname)

test('compile more than 73 blocks', async (t) => {
  try {
    const { compile, mfs } = compiler({
      context: resolveRelative('fixtures/73'),
      entry: 'app.mina',
      output: {
        filename: '[name]',
      },
      plugins: [
        new MinaEntryPlugin(),
      ],
    })

    await compile()

    t.true(mfs.existsSync('/pages/1.js'))
    t.true(mfs.existsSync('/pages/25.js'))
    t.pass()
  } catch (error) {
    console.log(error)
  }
})
