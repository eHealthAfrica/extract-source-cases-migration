'use strict'
var dataModels = require('data-models')

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

module.exports = fakeDoc
