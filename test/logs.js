'use strict'
var it         = require('tape')
  , chai       = require('tape-chai')
  , fakeDoc    = require('./support/fake-doc')
  , timekeeper = require('timekeeper')
  , dataModels = require('data-models')
  , last       = require('lodash/array/last')

var migrate = require('../lib')

it('adds script name to change log', function (expect) {
  var doc = fakeDoc()
  var result = migrate(doc)
  var log = last(result[0].changeLog)
  expect.propertyVal(log, 'user', 'extract-source-cases-migration')
  expect.end()
})

it('adds revision to change log', function (expect) {
  var doc = fakeDoc({_rev: '5-revision-hash-id'})
  var result = migrate(doc)
  var log = last(result[0].changeLog)
  expect.propertyVal(log, 'rev', '5-revision-hash-id')
  expect.end()
})

it('adds timestamp to change log', function (expect) {
  var doc = fakeDoc()
  var now = new Date(1422613414251)
  try {
    timekeeper.freeze(now)
    var result = migrate(doc)
    var log = last(result[0].changeLog)
    expect.propertyVal(log, 'timestamp', 1422613414251)
  } finally {
    timekeeper.reset()
    expect.end()
  }
})

it('adds source entry on created docs', function (expect) {
  var doc = fakeDoc()
  var created = migrate(doc)[1]
  expect.deepPropertyVal(created, 'sources[0].type', 'migration')
  expect.end()
})

it('adds migration name to source entry', function (expect) {
  var doc = fakeDoc()
  var created = migrate(doc)[1]
  expect.deepPropertyVal(created, 'sources[0].name'
                                , 'extract-source-cases-migration')
  expect.end()
})

it('adds timestamp to source entry', function (expect) {
  var doc = fakeDoc()
  var now = new Date(1422613414251)
  try {
    timekeeper.freeze(now)
    var created = migrate(doc)[1]
    expect.deepPropertyVal(created, 'sources[0].timestamp', 1422613414251)
  } finally {
    timekeeper.reset()
    expect.end()
  }
})

it('refers back into original doc', function (expect) {
  var doc = fakeDoc({_id: '123-cdef-678'})
  var created = migrate(doc)[1]
  expect.deepPropertyVal(created, 'sources[0].origin'
                                , '123-cdef-678/contact/source-cases/0')
  expect.end()
})

it('creates valid docs', function (expect) {
  var doc = fakeDoc()
  var result = migrate(doc)
  var errors = dataModels.validate(result[1])
  expect.notOk(errors)
  expect.end()
})

it('keeps original data', function (expect) {
  var doc = fakeDoc({contact: {sourceCases: [ { name: 'John Doe' } ]}})
  var created = migrate(doc)[1]
  expect.deepPropertyVal(created, 'sources[0].doc.name'
                                , 'John Doe')
  expect.end()
})
