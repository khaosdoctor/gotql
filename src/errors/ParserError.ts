import { format } from 'util'

export class ParserError extends Error {
  constructor (message: string) {
    super(format('Parse error: %s', message))
  }
}
