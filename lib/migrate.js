'use strict'
var clone   = require('lodash/lang/clone')
  , extract = require('./extract')
  , log     = require('./log')

function migrate (doc) {
  var sourceCases = extract(doc)
    , changeLog   = log('extract-source-cases-migration', doc)
    , update      = clone(doc, true)

  update.contact.sourceCases = sourceCases.update
  update.changeLog = changeLog

  return [update].concat(sourceCases.docs)
}

module.exports = migrate
