import replaceExt from 'replace-ext'
import path from 'path'
import { toSafeOutputPath } from '.'

const MAIN_PACKAGE = 'MAIN_PACKAGE'

export interface Entry {
  // name: for example `packageA/pages/index.js` or `_/_/another-package/comp.js`
  // TODO: should we remove `.js` in entry name ?
  name: string
  // realPath: the full real path of resource
  realPath: string
  // request: requst with loaders for SingleEntryPlugin
  request: string
  parents: Array<Entry>
}

// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#Implementing_basic_set_operations
const unionSet = <T>(setA: Set<T>, setB: Set<T>) => {
  var _union = new Set(setA)
  for (var elem of setB) {
    _union.add(elem)
  }
  return _union
}

// if a component was only used in the same subpackage
// it can be moved into that subpackage to reduce the bundle size of main package
// for example `components/myComponent` is only used by `packageA/pages/index`
// we can move it to `packageA/_/_/components/myComponent`
export const moveIntoSubpackage = (
  rootContext: string,
  subpackageRoots: Array<string>,
  rootEntry: Entry,
  entries: Array<Entry>
) => {
  const subpackageSets: Record<string, Set<string>> = {}

  const computeSubpackages = (entry: Entry) => {
    // remove `.js` in entry name
    const entryName = replaceExt(entry.name, '')
    if (subpackageSets[entryName]) {
      // already computed
      return
    }
    subpackageSets[entryName] = new Set<string>()
    if (entry === rootEntry) {
      // ignore if entry is app
      return
    } else if (entry.parents.length === 1 && entry.parents[0] === rootEntry) {
      // entry is page
      const relativeRealPath = path.relative(rootContext, entry.realPath)
      const matchedSubpackageRoot = subpackageRoots.find(root =>
        relativeRealPath.startsWith(`${root}/`)
      )
      const currentSubpackage = matchedSubpackageRoot || MAIN_PACKAGE
      subpackageSets[entryName].add(currentSubpackage)
    } else {
      // entry is component
      entry.parents.forEach(parentEntry => {
        computeSubpackages(parentEntry)
        // remove `.js` in entry name
        const parentEntryName = replaceExt(parentEntry.name, '')
        subpackageSets[entryName] = unionSet(
          subpackageSets[entryName],
          subpackageSets[parentEntryName]
        )
      })
    }
  }

  // move components into subpackage as possiable
  for (const entry of entries) {
    computeSubpackages(entry)
  }
  const subpackageMapping: Record<string, string> = {}
  for (const entry of entries) {
    // remove `.js` in entry name
    const entryName = replaceExt(entry.name, '')
    const subpackageSet = subpackageSets[entryName]
    if (subpackageSet.size === 1 && !subpackageSet.has(MAIN_PACKAGE)) {
      const subpackage = [...subpackageSet][0]
      const movedEntryName = path.join(
        subpackage,
        toSafeOutputPath(path.relative(subpackage, entry.name))
      )
      if (entry.name === movedEntryName) {
        // skip if entry name doesn't changed
        continue
      }
      entry.name = movedEntryName
      // save mapping
      subpackageMapping[entryName] = replaceExt(movedEntryName, '')
    }
  }
  return { subpackageMapping }
}
