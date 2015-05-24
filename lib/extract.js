'use strict'
var _         = require('lodash')
  , uuid      = require('pouchdb').utils.uuid
  , splitName = require('./split-name')

function extract (doc, sourceCase, index) {
  if (!sourceCase.personId) {
    var id  = uuid().toLowerCase()

    return [ update(sourceCase, id)
           , create(sourceCase, id, doc, index)
           ]
  } else {
    return [ sourceCase ]
  }
}

function update (original, id) {
  var rel = _.omit(original, 'id', 'name', 'phone', 'relative', 'onsetDate')
  rel.personId = id
  return rel
}

function create (original, id, doc, index) {
  var now = new Date()
    , person = { _id: id
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
                   , origin: docUri(doc, index)
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

function docUri (doc, index) {
  return [ doc._id
         , 'contact'
         , 'source-cases'
         , index
         ].join('/')
}

function extractSourceCases (doc) {
  var sourceCases = doc.contact.sourceCases
    , extracted = _.unzip(sourceCases.map(_.partial(extract, doc)))

  return { update: extracted[0]
         , docs: _.compact(extracted[1])
         }
}

module.exports = extractSourceCases
