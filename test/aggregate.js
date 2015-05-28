'use strict'
var it         = require('tape')
  , chai       = require('tape-chai')
  , fakeDoc    = require('./support/fake-doc')

var migrate = require('../lib')

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
