import test from 'ava'
import { moveIntoSubpackage, Entry } from '../../src/helpers/entry'

test('moveIntoSubpackage', t => {
  const rootEntry: Entry = {
    name: 'app.js',
    realPath: '/src/app.mina',
    request: '/src/app.mina',
    parents: [],
  }
  const pageA: Entry = {
    name: 'packageA/pages/index.js',
    realPath: '/src/packageA/pages/index.mina',
    request: '/src/packageA/pages/index.mina',
    parents: [rootEntry],
  }
  const pageB: Entry = {
    name: 'packageB/pages/index.js',
    realPath: '/src/packageB/pages/index.mina',
    request: '/src/packageB/pages/index.mina',
    parents: [rootEntry],
  }
  const componentA: Entry = {
    name: 'components/componentA.js',
    realPath: '/src/components/componentA.mina',
    request: '/src/components/componentA.mina',
    parents: [pageA],
  }
  const componentB: Entry = {
    name: 'components/componentB.js',
    realPath: '/src/components/componentB.mina',
    request: '/src/components/componentB.mina',
    parents: [componentA],
  }
  const componentC: Entry = {
    name: 'components/componentC.js',
    realPath: '/src/components/componentC.mina',
    request: '/src/components/componentC.mina',
    parents: [pageA, pageB],
  }
  const entries = [rootEntry, pageA, pageB, componentA, componentB, componentC]

  moveIntoSubpackage('/src', ['packageA', 'packageB'], rootEntry, entries)

  // move componentA into pageA
  const movedComponentA = entries.find(
    _ => _.realPath === '/src/components/componentA.mina'
  )
  t.truthy(movedComponentA)
  t.is(movedComponentA!.name, 'packageA/_/components/componentA.js')

  // move componentB into pageA
  const movedComponentB = entries.find(
    _ => _.realPath === '/src/components/componentB.mina'
  )
  t.truthy(movedComponentB)
  t.is(movedComponentB!.name, 'packageA/_/components/componentB.js')

  // should not move componentC
  const movedComponentC = entries.find(
    _ => _.realPath === '/src/components/componentC.mina'
  )
  t.truthy(movedComponentC)
  t.is(movedComponentC!.name, 'components/componentC.js')
})
