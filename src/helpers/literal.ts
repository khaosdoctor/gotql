import { LiteralObject } from '../types/Literal'

/**
 * Literal is a tagged template for an object { value: string, escape: false }
 * @example
 * // literal`example_pkey` return { value: 'example_pkey', escape: false }
 * @example
 * // literal`['example_key01', 'example_key02']` return { value: '['example_key01', 'example_key02']', escape: false }
 * @param {TemplateStringsArray} literalValue Literal value
 * @return {LiteralObject} LiteralObject
 */
export function literal(literalValue: TemplateStringsArray): LiteralObject {
  return { value: literalValue[0] || '', escape: false }
}
