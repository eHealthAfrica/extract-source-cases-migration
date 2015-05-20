'use strict'
var timekeeper = require('timekeeper')
  , dataModels = require('data-models')

var transform = require('./')
  , it = require('tape')
  , chai = require('tape-chai')

function fakeDoc(props) {
  var doc = dataModels.generate('person', 1).person[0]
  doc._rev = '8-3a99b57d89647c15056dfb6a0ae9eb77'
  doc.contact =
    { status: 'active'
    , sourceCases: [ { id: 'q0255' } ]
    }

  for (var key in props) {
    doc[key] = props[key]
  }

  return doc
}

// abort ----------------------------------------------------------------------

it('aborts when there is no input', function (expect) {
  var result = transform(null)
  expect.notOk(result)
  expect.end()
})

it('aborts when there is no contact', function (expect) {
  var result = transform({})
  expect.notOk(result)
  expect.end()
})

it('aborts when there are no source cases', function (expect) {
  var result = transform({ contact: {} })
  expect.notOk(result)
  expect.end()
})

it('aborts when already related to external case', function (expect) {
  var result = transform({ contact: { sourceCases: [
    { personId: 'some-person-id' }
  ]}})
  expect.notOk(result)
  expect.end()
})

// transform ------------------------------------------------------------------

it('returns transformed original', function(expect) {
  var doc = fakeDoc({_id: '123-cdef-678'})
  var result = transform(doc)
  expect.propertyVal(result[0], '_id', '123-cdef-678')
  expect.end()
})

it('copies revision', function (expect) {
  var doc = fakeDoc({_revision: '5-revision-hash-id'})
  var changed = transform(doc)[0]
  expect.propertyVal(changed, '_revision', '5-revision-hash-id')
  expect.end()
})

it('references extracted source cases', function (expect) {
  var doc = fakeDoc()
  var result = transform(doc)
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
  var result = transform(doc)
  var nested = result[0].contact.sourceCases[0]
  expect.propertyVal(nested, 'personId', 'd64263ec-8a1a-3a99-8118-474bfec2d287')
  expect.end()
})

it('removes case id from source case', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { id: 'qx0255' }
  ]}})
  var result = transform(doc)
  var nested = result[0].contact.sourceCases[0]
  expect.notProperty(nested, 'id')
  expect.end()
})

it('removes phone number from source case', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { phone: '12345678' }
  ]}})
  var result = transform(doc)
  var nested = result[0].contact.sourceCases[0]
  expect.notProperty(nested, 'phone')
  expect.end()
})

it('removes onsetDate from source case', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { onsetDate: '2015-05-20T11:44:53.427Z' }
  ]}})
  var result = transform(doc)
  var nested = result[0].contact.sourceCases[0]
  expect.notProperty(nested, 'onsetDate')
  expect.end()
})

it('removes info on relative from source case', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { relative: { phone: '12345678' } }
  ]}})
  var result = transform(doc)
  var nested = result[0].contact.sourceCases[0]
  expect.notProperty(nested, 'relative')
  expect.end()
})

it('removes name from source case', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { name: 'John Doe' }
  ]}})
  var result = transform(doc)
  var nested = result[0].contact.sourceCases[0]
  expect.notProperty(nested, 'name')
  expect.end()
})

it('keeps other info in nested source case doc', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { exposures: [ 'objects' ] }
  ]}})
  var result = transform(doc)
  var nested = result[0].contact.sourceCases[0]
  expect.deepPropertyVal(nested, 'exposures[0]', 'objects')
  expect.end()
})

it('produces valid doc for changed original', function (expect) {
  var doc = fakeDoc()
  var result = transform(doc)
  var errors = dataModels.validate(result[0])
  expect.notOk(errors)
  expect.end()
})

// extract --------------------------------------------------------------------

it('returns extracted cases', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases:
    [ {id: 'ID-0203'} ]
  }})
  var result = transform(doc)
  expect.deepPropertyVal(result[1], 'case.id', 'ID-0203')
  expect.end()
})

it('does not extract external source cases', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases:
    [ {personId: 'd64263ec-8a1a-3a99-8118-474bfec2d287'}
    , {}
    ]
  }})
  var result = transform(doc)
  expect.equal(result.length, 2)
  expect.end()
})

it('creates person doc', function (expect) {
  var doc = fakeDoc()
  var created = transform(doc)[1]
  expect.propertyVal(created, 'doc_type', 'person')
  expect.end()
})

it('creates versioned doc', function (expect) {
  var doc = fakeDoc()
  var created = transform(doc)[1]
  expect.propertyVal(created, 'version', '1.16.0')
  expect.end()
})

it('creates timestamp', function (expect) {
  var doc = fakeDoc()
  var now = Date.parse('2015-03-11T10:45:14.715Z')
  try {
    timekeeper.freeze(now)
    var created = transform(doc)[1]
    expect.propertyVal(created, 'createdDate', '2015-03-11T10:45:14.715Z')
  } finally {
    timekeeper.reset()
    expect.end()
  }
})

it('creates case with status', function (expect) {
  var doc = fakeDoc()
  var created = transform(doc)[1]
  expect.deepPropertyVal(created, 'case.status', 'unknown')
  expect.end()
})

it('transfers onset date to case when given', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { onsetDate: '2015-05-20T11:44:53.427Z' }
  ]}})
  var created = transform(doc)[1]
  expect.deepPropertyVal(created, 'case.onsetDate', '2015-05-20T11:44:53.427Z')
  expect.end()
})

it('transfers phone number', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    {phone: '123456789'}
  ]}})
  var created = transform(doc)[1]
  expect.propertyVal(created, 'phoneNumber', '123456789')
  expect.end()
})

it('transfers info on relative', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { relative: { phone: '2345612' } }
  ]}})
  var created = transform(doc)[1]
  expect.deepPropertyVal(created, 'relative.phone', '2345612')
  expect.end()
})

it('extracts surname', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { name: 'Sally S. Doe' }
  ]}})
  var created = transform(doc)[1]
  expect.propertyVal(created, 'surname', 'Doe')
  expect.end()
})

it('extracts other names', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { name: 'Sally S. Doe' }
  ]}})
  var created = transform(doc)[1]
  expect.propertyVal(created, 'otherNames', 'Sally S.')
  expect.end()
})

it('takes single name for other names', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { name: 'Sally' }
  ]}})
  var created = transform(doc)[1]
  expect.propertyVal(created, 'otherNames', 'Sally')
  expect.end()
})

it('skips surname when single name', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases: [
    { name: 'Sally' }
  ]}})
  var created = transform(doc)[1]
  expect.notProperty(created, 'surname')
  expect.end()
})

// meta-data ------------------------------------------------------------------

it('adds script name to change log', function (expect) {
  var doc = fakeDoc()
  var result = transform(doc)
  var changed = result[0]
  expect.deepPropertyVal(changed, 'changeLog[0].user'
                                , 'extract-source-cases-migration')
  expect.end()
})

it('adds revision to change log', function (expect) {
  var doc = fakeDoc({_rev: '5-revision-hash-id'})
  var result = transform(doc)
  var changed = result[0]
  expect.deepPropertyVal(changed, 'changeLog[0].rev', '5-revision-hash-id')
  expect.end()
})

it('adds timestamp to change log', function (expect) {
  var doc = fakeDoc()
  var now = new Date(1422613414251)
  try {
    timekeeper.freeze(now)
    var result = transform(doc)
    var changed = result[0]
    expect.deepPropertyVal(changed, 'changeLog[0].timestamp'
                                  , 1422613414251)
  } finally {
    timekeeper.reset()
    expect.end()
  }
})

it('adds source entry on created docs', function (expect) {
  var doc = fakeDoc()
  var created = transform(doc)[1]
  expect.deepPropertyVal(created, 'sources[0].type', 'migration')
  expect.end()
})

it('adds migration name to source entry', function (expect) {
  var doc = fakeDoc()
  var created = transform(doc)[1]
  expect.deepPropertyVal(created, 'sources[0].name'
                                , 'extract-source-cases-migration')
  expect.end()
})

it('adds timestamp to source entry', function (expect) {
  var doc = fakeDoc()
  var now = new Date(1422613414251)
  try {
    timekeeper.freeze(now)
    var result = transform(doc)
    var created = result[1]
    expect.deepPropertyVal(created, 'sources[0].timestamp', 1422613414251)
  } finally {
    timekeeper.reset()
    expect.end()
  }
})

it('refers back into original doc', function (expect) {
  var doc = fakeDoc({_id: '123-cdef-678'})
  var created = transform(doc)[1]
  expect.deepPropertyVal(created, 'sources[0].origin'
                                , '123-cdef-678/contact/source-cases/0')
  expect.end()
})

it('creates valid docs', function (expect) {
  var doc = fakeDoc()
  var result = transform(doc)
  var errors = dataModels.validate(result[1])
  expect.notOk(errors)
  expect.end()
})
