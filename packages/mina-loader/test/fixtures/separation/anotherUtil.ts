export default async function AnotherUtils(params: {
  x: number
  y: number
}): Promise<number> {
  return params.x * params.y
}
