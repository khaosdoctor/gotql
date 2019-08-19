import { format } from 'util'

export class RunnerError extends Error {
  constructor (message: string) {
    super(format('Runner error: %s', message))
  }
}
