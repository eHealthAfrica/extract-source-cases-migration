'use strict'
var assign     = require('lodash/object/assign')
  , dataModels = require('data-models')
  , defaults   = { _rev: '8-3a99b57d89647c15056dfb6a0ae9eb74'
                 , contact:
                   { status: 'active'
                   , sourceCases:
                     [ { id: 'q0255' } ]
                   }
                 }

function fakeDoc(props) {
  var doc = dataModels.generate('person', 1).person[0]
  return assign(doc, defaults, props)
}

module.exports = fakeDoc
