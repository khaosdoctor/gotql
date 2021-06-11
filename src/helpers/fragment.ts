/**
 * Fragment returns a fragment valid name '...name'
 * @example
 * fragment`example_pkey` returns '...example_pkey'
 * @param {TemplateStringsArray} fragmentName Fragment name
 * @return {LiteralObject} LiteralObject
 */
export function fragment (fragmentName: TemplateStringsArray): `...${string}` {
  if (!fragmentName || !fragmentName[0]) throw new Error(`Fragment name cannot be empty`)
  return `...${fragmentName[0]}`
}
