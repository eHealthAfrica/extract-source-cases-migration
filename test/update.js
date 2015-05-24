'use strict'
var it         = require('tape')
  , chai       = require('tape-chai')
  , fakeDoc    = require('./support/fake-doc')
  , dataModels = require('data-models')

var migrate = require('../lib')

it('returns transformed original', function(expect) {
  var doc = fakeDoc({_id: '123-cdef-678'})
  var result = migrate(doc)
  expect.propertyVal(result[0], '_id', '123-cdef-678')
  expect.end()
})

it('copies revision', function (expect) {
  var doc = fakeDoc({_revision: '5-revision-hash-id'})
  var changed = migrate(doc)[0]
  expect.propertyVal(changed, '_revision', '5-revision-hash-id')
  expect.end()
})

it('references extracted source cases', function (expect) {
  var doc = fakeDoc()
  var result = migrate(doc)
  var nested = result[0].contact.sourceCases[0]
  var person = result[1]
  expect.propertyVal(nested, 'personId', person._id)
  expect.end()
})

it('does not transform already extracted source cases', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases:
    [ {personId: 'd64263ec-8a1a-3a99-8118-474bfec2d287'}
    , {}
    ]
  }})
  var result = migrate(doc)
  var nested = result[0].contact.sourceCases[0]
  expect.propertyVal(nested, 'personId', 'd64263ec-8a1a-3a99-8118-474bfec2d287')
  expect.end()
})

it('removes case id from source case', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { id: 'qx0255' }
  ]}})
  var result = migrate(doc)
  var nested = result[0].contact.sourceCases[0]
  expect.notProperty(nested, 'id')
  expect.end()
})

it('removes phone number from source case', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { phone: '12345678' }
  ]}})
  var result = migrate(doc)
  var nested = result[0].contact.sourceCases[0]
  expect.notProperty(nested, 'phone')
  expect.end()
})

it('removes onsetDate from source case', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { onsetDate: '2015-05-20T11:44:53.427Z' }
  ]}})
  var result = migrate(doc)
  var nested = result[0].contact.sourceCases[0]
  expect.notProperty(nested, 'onsetDate')
  expect.end()
})

it('removes info on relative from source case', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { relative: { phone: '12345678' } }
  ]}})
  var result = migrate(doc)
  var nested = result[0].contact.sourceCases[0]
  expect.notProperty(nested, 'relative')
  expect.end()
})

it('removes name from source case', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { name: 'John Doe' }
  ]}})
  var result = migrate(doc)
  var nested = result[0].contact.sourceCases[0]
  expect.notProperty(nested, 'name')
  expect.end()
})

it('keeps other info in nested source case doc', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { exposures: [ 'objects' ] }
  ]}})
  var result = migrate(doc)
  var nested = result[0].contact.sourceCases[0]
  expect.deepPropertyVal(nested, 'exposures[0]', 'objects')
  expect.end()
})

it('produces valid doc for changed original', function (expect) {
  var doc = fakeDoc()
  var result = migrate(doc)
  var errors = dataModels.validate(result[0])
  expect.notOk(errors)
  expect.end()
})
