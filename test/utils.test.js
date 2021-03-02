import test from 'ava'
import { isNone, isEvent, genericError, parsePath } from '../src/utils'

test('isNone - should return true|false values', (t) => {
  t.true(isNone())
  t.true(isNone(null))
  t.true(isNone(undefined))
  t.true(isNone(''))
  t.true(isNone([]))
  t.true(isNone({}))
  t.false(isNone(0))
  t.false(isNone(-1))
  t.false(isNone(['hello']))
  t.false(isNone('hello'))
  t.false(isNone({ hello: 'world' }))
})

test('isEvent - should return true|false values', (t) => {
  class Event {}
  const evt = new window.Event('click')

  evt.nativeEvent = new Event()

  t.true(isEvent(evt))
  t.false(isEvent([]))
  t.false(isEvent({}))
  t.false(isEvent(''))
  t.false(isEvent())
})

test('genericError - should return an error object', (t) => {
  const err = genericError('this is an error', {
    hello: 'world',
  })

  t.true(err instanceof Error)
  t.is(err.message, 'this is an error')
  t.is(err.hello, 'world')
  t.not(err.world, 'hello')
})

test('parsePath - should return parsed path (array)', (t) => {
  t.deepEqual(parsePath('a.b.c'), ['a', 'b', 'c'])
  t.deepEqual(parsePath('a[1].c'), ['a', 1, 'c'])
  t.deepEqual(parsePath(), [])
  t.deepEqual(parsePath('a[0a].c'), ['a', 'c'])

  // NOTE negative array index
  t.deepEqual(parsePath('a[-1].c'), ['a', -1, 'c'])
})
