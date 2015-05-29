'use strict'
var it         = require('tape')
  , chai       = require('tape-chai')
  , fakeDoc    = require('./support/fake-doc')
  , timekeeper = require('timekeeper')

var migrate = require('../lib')

it('returns extracted cases', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases:
    [ {id: 'ID-0203'} ]
  }})
  var result = migrate(doc)
  expect.deepPropertyVal(result[1], 'case.id', 'ID-0203')
  expect.end()
})

it('does not extract external source cases', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases:
    [ {personId: 'd64263ec-8a1a-3a99-8118-474bfec2d287'}
    , {}
    ]
  }})
  var result = migrate(doc)
  expect.equal(result.length, 2)
  expect.end()
})

it('creates person doc', function (expect) {
  var doc = fakeDoc()
  var created = migrate(doc)[1]
  expect.propertyVal(created, 'doc_type', 'person')
  expect.end()
})

it('creates versioned doc', function (expect) {
  var doc = fakeDoc()
  var created = migrate(doc)[1]
  expect.propertyVal(created, 'version', '1.16.0')
  expect.end()
})

it('creates timestamp', function (expect) {
  var doc = fakeDoc()
  var now = Date.parse('2015-03-11T10:45:14.715Z')
  try {
    timekeeper.freeze(now)
    var created = migrate(doc)[1]
    expect.propertyVal(created, 'createdDate', '2015-03-11T10:45:14.715Z')
  } finally {
    timekeeper.reset()
    expect.end()
  }
})

it('creates case with status', function (expect) {
  var doc = fakeDoc()
  var created = migrate(doc)[1]
  expect.deepPropertyVal(created, 'case.status', 'unknown')
  expect.end()
})

it('transfers onset date to case when given', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { onsetDate: '2015-05-20T11:44:53.427Z' }
  ]}})
  var created = migrate(doc)[1]
  expect.deepPropertyVal(created, 'case.onsetDate', '2015-05-20T11:44:53.427Z')
  expect.end()
})

it('transfers phone number', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    {phone: '123456789'}
  ]}})
  var created = migrate(doc)[1]
  expect.propertyVal(created, 'phoneNumber', '123456789')
  expect.end()
})

it('transfers info on relative', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { relative: { phone: '2345612' } }
  ]}})
  var created = migrate(doc)[1]
  expect.deepPropertyVal(created, 'relative.phone', '2345612')
  expect.end()
})

it('extracts surname', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { name: 'Sally S. Doe' }
  ]}})
  var created = migrate(doc)[1]
  expect.propertyVal(created, 'surname', 'Doe')
  expect.end()
})

it('extracts other names', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { name: 'Sally S. Doe' }
  ]}})
  var created = migrate(doc)[1]
  expect.propertyVal(created, 'otherNames', 'Sally S.')
  expect.end()
})

it('takes single name for other names', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { name: 'Sally' }
  ]}})
  var created = migrate(doc)[1]
  expect.propertyVal(created, 'otherNames', 'Sally')
  expect.end()
})

it('skips surname when single name', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { name: 'Sally' }
  ]}})
  var created = migrate(doc)[1]
  expect.notProperty(created, 'surname')
  expect.end()
})
