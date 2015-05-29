'use strict'
var it         = require('tape')
  , chai       = require('tape-chai')
  , fakeDoc    = require('./support/fake-doc')

var migrate = require('../lib')

function firstRel (aggregator) {
  return aggregator[Object.keys(aggregator)[0]]
}

it('aggregates cases with matching id and name', function (expect) {
  var aggregator = Object.create(null)
  var doc = fakeDoc({ contact: { sourceCases:
    [ { id: 'ID-0203', name: 'John Doe', phone: '123456789' }
    , { id: 'ID-0203', name: 'John Doe', phone: '' }
    ]
  }})
  var result = migrate(doc, aggregator)
  expect.lengthOf(result, 2)
  expect.end()
})

it('shares id on duplicates', function (expect) {
  var aggregator = Object.create(null)
  var doc = fakeDoc({ contact: { sourceCases:
    [ { id: 'ID-0203', name: 'John Doe' }
    , { id: 'ID-0203', name: 'John Doe' }
    ]
  }})
  migrate(doc, aggregator)
  var rel = firstRel(aggregator)
  expect.equal(rel[0]._id, rel[1]._id)
  expect.end()

})

it('ignores case when matching', function (expect) {
  var aggregator = Object.create(null)
  var doc = fakeDoc({ contact: { sourceCases:
    [ { id: 'ID-0203', name: 'JOHN DOE' }
    , { id: 'Id-0203', name: 'John Doe' }
    ]
  }})
  var result = migrate(doc, aggregator)
  expect.lengthOf(result, 2)
  expect.end()
})

it('ignores whitespace differences when matching', function (expect) {
  var aggregator = Object.create(null)
  var doc = fakeDoc({ contact: { sourceCases:
    [ { id: 'ID-0203', name: 'JOHN   DOE' }
    , { id: ' ID-0203 ', name: 'JOHN DOE' }
    ]
  }})
  var result = migrate(doc, aggregator)
  expect.lengthOf(result, 2)
  expect.end()
})

it('ignores abbreviation dots when matching', function (expect) {
  var aggregator = Object.create(null)
  var doc = fakeDoc({ contact: { sourceCases:
    [ { id: 'ID-0203', name: 'JOHN P. DOE' }
    , { id: 'ID-0203', name: 'JOHN P DOE' }
    ]
  }})
  var result = migrate(doc, aggregator)
  expect.lengthOf(result, 2)
  expect.end()
})

it('does not aggregate docs with empty case id', function (expect) {
  var aggregator = Object.create(null)
  var doc = fakeDoc({ contact: { sourceCases:
    [ { id: '', name: 'John Doe' }
    , { id: '', name: 'John Doe' }
    ]
  }})
  var result = migrate(doc, aggregator)
  expect.lengthOf(result, 3)
  expect.end()
})

it('does not aggregate docs with whitespace only case id', function (expect) {
  var aggregator = Object.create(null)
  var doc = fakeDoc({ contact: { sourceCases:
    [ { id: ' ', name: 'John Doe' }
    , { id: ' ', name: 'John Doe' }
    ]
  }})
  var result = migrate(doc, aggregator)
  expect.lengthOf(result, 3)
  expect.end()
})

it('does not aggregate docs without case id', function (expect) {
  var aggregator = Object.create(null)
  var doc = fakeDoc({ contact: { sourceCases:
    [ { name: 'John Doe' }
    , { name: 'John Doe' }
    ]
  }})
  var result = migrate(doc, aggregator)
  expect.lengthOf(result, 3)
  expect.end()
})
