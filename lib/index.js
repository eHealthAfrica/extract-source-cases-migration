'use strict'
var check   = require('./check')
  , migrate = require('./migrate')

function digest(doc) {
  if (check(doc)) {
    return migrate(doc)
  } else {
    return null
  }
}

module.exports = digest
