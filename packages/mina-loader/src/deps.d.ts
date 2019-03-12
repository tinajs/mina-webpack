declare module '@tinajs/mina-sfc' {
  interface MinaSfcDef {
    style: any
    config: any
    script: any
    template: any
  }

  function parse(source: string): MinaSfcDef
}
