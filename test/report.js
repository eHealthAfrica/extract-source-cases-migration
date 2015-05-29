'use strict'
var it   = require('tape')
  , chai = require('tape-chai')
  , time = require('timekeeper')

var report = require('../lib/report')

it('duration is zero when not started', function (expect) {
  var reporter = report()
  expect.propertyVal(reporter, 'duration', '00:00:00')
  expect.end()
})

it('reports current duration', function (expect) {
  var start = new Date(10000)
    , now   = new Date(42000)
  var reporter = report()
  try {
    time.freeze(start)
    reporter.start()
    time.freeze(now)
    expect.propertyVal(reporter, 'duration', '00:00:32')
  } finally {
    time.reset()
    expect.end()
  }
})

it('keeps record of duration', function (expect) {
  var start = new Date(10000)
    , stop  = new Date(42000)
    , now   = new Date(88888)
  var reporter = report()
  try {
    time.freeze(start)
    reporter.start()
    time.freeze(stop)
    reporter.stop()
    time.freeze(now)
    expect.propertyVal(reporter, 'duration', '00:00:32')
  } finally {
    time.reset()
    expect.end()
  }
})

it('defaults total docs to 0', function (expect) {
  var reporter = report()
  expect.propertyVal(reporter, 'total', 0)
  expect.end()
})

it('counts total docs', function (expect) {
  var reporter = report()
  reporter.count([{_rev: '1-fg67'}, {}, {_rev: '8-ffff'}])
  expect.propertyVal(reporter, 'total', 3)
  expect.end()
})

it('defaults updated docs to 0', function (expect) {
  var reporter = report()
  expect.propertyVal(reporter, 'updated', 0)
  expect.end()
})

it('counts updated docs', function (expect) {
  var reporter = report()
  reporter.count([{_rev: '1-fg67'}, {}, {_rev: '8-ffff'}])
  expect.propertyVal(reporter, 'updated', 2)
  expect.end()
})

it('defaults created docs to 0', function (expect) {
  var reporter = report()
  expect.propertyVal(reporter, 'created', 0)
  expect.end()
})

it('counts created docs', function (expect) {
  var reporter = report()
  reporter.count([{_rev: '1-fg67'}, {}, {_rev: '8-ffff'}])
  expect.propertyVal(reporter, 'created', 1)
  expect.end()
})

it('accumulates multiple counts', function (expect) {
  var reporter = report()
  reporter.count([{}, {}, {}])
  reporter.count([{}, {}])
  expect.propertyVal(reporter, 'created', 5)
  expect.end()
})

it('allows tracking of arbitrary data', function (expect) {
  var reporter = report()
  reporter.info('foo', {bar: 234, baz: 'xxx'})
  var datum = reporter.info('foo')
  expect.deepEqual(datum, {bar: 234, baz: 'xxx'})
  expect.end()
})

it('allows counting of arbitrary data', function (expect) {
  var reporter = report()
  reporter.count( [{foo: 3}, {foo: 2}, {bar: 3}]
                , function (doc) { return {foo: doc.foo} }
                )
  var amount = reporter.amount('foo')
  expect.equal(amount, 5)
  expect.end()
})

it('defaults any unknown amount to 0', function (expect) {
  var reporter = report()
  var amount = reporter.amount('baz')
  expect.equal(amount, 0)
  expect.end()
})

it('does not complain counting skipped results', function (expect) {
  var reporter = report()
  expect.doesNotThrow(function () { reporter.count(null) })
  expect.end()
})
