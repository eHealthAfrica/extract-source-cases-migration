'use strict'
var _         = require('lodash')
  , uuid      = require('pouchdb').utils.uuid
  , splitName = require('./split-name')

function docUri (doc, index) {
  return [ doc._id
         , 'contact'
         , 'source-cases'
         , index
         ].join('/')
}

function create (original, parent, index) {
  var now = new Date()
    , person = { _id: uuid().toLowerCase()
               , doc_type: 'person'
               , version: '1.16.0'
               , createdDate: now.toISOString()
               , case:
                 { id: original.id
                 , status: 'unknown'
                 }
               , sources:
                 [ { type: 'migration'
                   , name: 'extract-source-cases-migration'
                   , timestamp: now.getTime()
                   , origin: docUri(parent, index)
                   }
                 ]
               }

  _.assign(person, splitName(original.name))

  if (original.phone) {
    person.phoneNumber = original.phone
  }

  if (original.relative) {
    person.relative = original.relative
  }

  if (original.onsetDate) {
    person.case.onsetDate = original.onsetDate
  }

  return person
}

module.exports = create
