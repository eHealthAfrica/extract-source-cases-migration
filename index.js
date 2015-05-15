'use strict'
var utils = require('pouchdb').utils

function notMigrated (cases) {
    return cases.some(function (c) { return !c.personId })
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

      docs = [transformed]

      transformed.contact.sourceCases = original.contact.sourceCases.map(
        function (sourceCase) {
          if (sourceCase.personId) {
            return sourceCase
          } else {
            var inline = { personId: utils.uuid().toLowerCase()
                         }
              , person = { _id: inline.personId
                         , docType: 'person'
                         , version: '1.16.0'
                         , createdDate: now.toISOString()
                         , "case": { id: sourceCase.id }
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
