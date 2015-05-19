'use strict'
var utils = require('pouchdb').utils

function notMigrated (cases) {
    return cases.some(function (c) { return !c.personId })
}

function extractNames (name) {
  if (name) {
    var names = name.split(/\s+/)
    if (names.length > 1) {
      return [ names.slice(0, -1).join(' ')
             , names.splice(-1)[0]
             ]
    } else {
      return [names[0], null]
    }
  } else {
    return [null, null]
  }
}

function transform (original) {
  var docs = null

  if (original && original.contact && original.contact.sourceCases) {
    var originalCases = original.contact.sourceCases

    if (notMigrated(originalCases)) {
      var transformed = {}
        , cases = []
        , now = new Date()
        , key

      for (key in original) {
        transformed[key] = original[key]
      }

      transformed.contact = {}

      for (key in original.contact) {
        transformed.contact[key] = original.contact[key]
      }

      transformed.changeLog = transformed.changeLog || []
      transformed.changeLog.push(
        { user: 'extract-source-cases-migration'
        , rev: original._rev
        , timestamp: now.getTime()
        }
      )

      docs = [transformed]

      transformed.contact.sourceCases = original.contact.sourceCases.map(
        function (sourceCase, index) {
          if (sourceCase.personId) {
            return sourceCase
          } else {
            var id = utils.uuid().toLowerCase()
              , inline = { personId: id }
              , person = { _id: id
                         , doc_type: 'person'
                         , version: '1.16.0'
                         , createdDate: now.toISOString()
                         , "case":
                           { id: sourceCase.id
                           , status: 'unknown'
                           }
                         , sources:
                           [ { type: 'migration'
                             , name: 'extract-source-cases-migration'
                             , timestamp: now.getTime()
                             , origin: [ original._id
                                       , 'contact'
                                       , 'source-cases'
                                       , index
                                       ].join('/')
                             }
                           ]
                         }

            var names  = extractNames(sourceCase.name)

            if (names[0]) {
              person.otherNames = names[0]
            }

            if (names[1]) {
              person.surname = names[1]
            }

            if (sourceCase.phone) {
              person.phoneNumber = sourceCase.phone
            }

            if (sourceCase.relative) {
              person.relative = sourceCase.relative
            }

            for (key in sourceCase) {
              if (['id', 'phone', 'relative', 'name'].indexOf(key) < 0) {
                inline[key] = sourceCase[key]
              }
            }
            docs.push(person)

            return inline
          }
        }
      )
    }
  }

  return docs
}

module.exports = transform
