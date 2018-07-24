type PageDefs = { onLoad: () => void }

declare var Page: (PageDefs) => any

type WxPage = {
  setData: (object) => void
}

Page({
  onLoad(this: WxPage) {
    this.setData({
      msg: 'Hello from TS Page!',
    })
  },
})
