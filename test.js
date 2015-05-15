'use strict'
var timekeeper = require('timekeeper')

var transform = require('./')
  , it = require('tape')
  , chai = require('tape-chai')

function fakeDoc(props) {
  var doc =
    { _id: '00ae40fe-7b6f-4cea-df66-e00b59713944'
    , _rev: '8-3a99b57d89647c15056dfb6a0ae9eb77'
    , contact:
      { sourceCases:
        [
          { id: 'q0255' }
        ]
      }
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
  var doc = fakeDoc({ contact: { sourceCases:
    [ {} ]
  }})
  var result = transform(doc)
  var personId = result[0].contact.sourceCases[0].personId
  var person = result[1]
  expect.equal(personId, person._id)
  expect.end()
})

it('does not transform already extracted source cases', function (expect) {
  var doc = fakeDoc({ contact: { sourceCases:
    [ {personId: 'd64263ec-8a1a-3a99-8118-474bfec2d287'}
    , {}
    ]
  }})
  var result = transform(doc)
  var personId = result[0].contact.sourceCases[0].personId
  expect.equal(personId, 'd64263ec-8a1a-3a99-8118-474bfec2d287')
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
  expect.propertyVal(created, 'docType', 'person')
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
