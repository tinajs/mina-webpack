type PageDefs = { onLoad: () => void }

declare var Page: (PageDefs) => any

type WxPage = {
  setData: (object) => void
}

import Util from './anotherUtil'

Page({
  onLoad(this: WxPage) {
    Util({ x: 1, y: 2 }).then(result => {
      this.setData({
        msg: 'Hello from TS Page!',
        result,
      })
    })
  },
})
