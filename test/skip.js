'use strict'
var it         = require('tape')
  , chai       = require('tape-chai')
  , fakeDoc    = require('./support/fake-doc')

var migrate = require('../lib')

it('aborts when there is no input', function (expect) {
  var result = migrate(null)
  expect.notOk(result)
  expect.end()
})

it('aborts when there is no contact', function (expect) {
  var result = migrate({})
  expect.notOk(result)
  expect.end()
})

it('aborts when there are no source cases', function (expect) {
  var result = migrate({ contact: {} })
  expect.notOk(result)
  expect.end()
})

it('aborts when already related to external case', function (expect) {
  var result = migrate({ contact: { sourceCases: [
    { personId: 'some-person-id' }
  ]}})
  expect.notOk(result)
  expect.end()
})
