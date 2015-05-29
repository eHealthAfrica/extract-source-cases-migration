'use strict'
var check   = require('./check')
  , migrate = require('./migrate')

function digest(doc, aggregator) {
  if (check(doc)) {
    return migrate(doc, aggregator)
  } else {
    return null
  }
}

module.exports = digest
