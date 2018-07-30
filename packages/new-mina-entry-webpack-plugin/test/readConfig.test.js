const test = require('ava')
const { resolve } = require('path')
const readConfig = require('../src/readConfig')

test('read config from full mina path', t => {
  const page1Path = resolve(__dirname, 'fixtures/pages/page1/page1.mina')
  const config = readConfig(page1Path)
  t.deepEqual(config, {
    "usingComponents": {
      "a": "/components/a",
      "b": "components/b",
      "c": "./components/c",
      "d": "../../components/d"
    }
  })
})

test('read config from mina file without extension', t => {
  const page1Path = resolve(__dirname, 'fixtures/pages/page1/page1')
  const config = readConfig(page1Path)
  t.deepEqual(config, {
    "usingComponents": {
      "a": "/components/a",
      "b": "components/b",
      "c": "./components/c",
      "d": "../../components/d"
    }
  })
})

test('read config from full json path', t => {
  const page2Path = resolve(__dirname, 'fixtures/pages/page2/page2.json')
  const config = readConfig(page2Path)
  t.deepEqual(config, {
    "usingComponents": {
      "a": "/components/a",
      "b": "components/b",
      "c": "./components/c",
      "d": "../../components/d"
    }
  })
})

test('read config from json file without extension', t => {
  const page2Path = resolve(__dirname, 'fixtures/pages/page2/page2')
  const config = readConfig(page2Path)
  t.deepEqual(config, {
    "usingComponents": {
      "a": "/components/a",
      "b": "components/b",
      "c": "./components/c",
      "d": "../../components/d"
    }
  })
})
