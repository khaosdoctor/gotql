import { query } from './query'
import { mutation } from './mutation'
import { parse as parser } from './modules/parser'
import { literal } from './helpers/literal'

module.exports = { query, mutation, parser, literal }
export { query, mutation, parser, literal }
