'use strict'
var it   = require('tape')
  , chai = require('tape-chai')
  , _    = require('lodash')

var merge = require('../lib/merge')

it('returns merged original', function (expect) {
  var doc = { _id: '011f5', _rev: '3-df209a' }
    , rels = { '011f5' : [ { _id: '011f5', surname: 'Doe' }
                         , { _id: '011f5', otherNames: 'John' }
                         ]
             }
  var result = merge(doc, rels)
  expect.deepEqual( _.omit(result[0], 'sources' )
                  , { _id: '011f5'
                    , _rev: '3-df209a'
                    , surname: 'Doe'
                    , otherNames: 'John'
                    }
                  )
  expect.end()
})

it('applies merge only once', function (expect) {
  var doc = { _id: '011f5', _rev: '3-df209a' }
    , rels = { '011f5' : [ { _id: '011f5' } ] }
  merge(doc, rels)
  var result = merge(doc, rels)
  expect.notOk(result)
  expect.end()
})

it('skips unrelated docs', function (expect) {
  var doc = { _id: '2dbfb', _rev: '3-df209a' }
    , rels = { '011f5' : [ { _id: '011f5' } ] }
  var result = merge(doc, rels)
  expect.notOk(result)
  expect.end()
})

it('merges sources', function (expect) {
  var doc = { _id: '011f5', _rev: '3-df209a' }
    , rels = { '011f5' : [ { _id: '011f5'
                           , sources: [{origin: '2dbfb/contact/sourceCases/3'}]
                           }
                         , { _id: '011f5'
                           , sources: [{origin: 'd6fe1/contact/sourceCases/0'}]
                           }
                         ]
             }
  var result = merge(doc, rels)
  expect.deepEqual( result[0].sources
                  , [ {origin: '2dbfb/contact/sourceCases/3'}
                    , {origin: 'd6fe1/contact/sourceCases/0'}
                    ]
                  )
  expect.end()
})
