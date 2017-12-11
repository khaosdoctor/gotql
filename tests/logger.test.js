import describe from 'ava'
import sinon from 'sinon'
import Logger from '../src/modules/logger'

describe('Should print a message when debug is true', assert => {
  const oldcons = console.log
  console.log = sinon.spy()

  const log = new Logger(true)

  log.log('test')
  assert.true(console.log.called)
  console.log = oldcons
})

describe('Should not print a message when debug is false', assert => {
  const oldcons = console.log
  console.log = sinon.spy()

  const log = new Logger(false)

  log.log('test')
  assert.false(console.log.called)
  console.log = oldcons
})
