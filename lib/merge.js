'use strict'
var _ = require('lodash')

function merge (original, rels) {
  var id  = original._id
    , rel = rels[id]
  if (rel) {
    rels[id] = null
    var doc = _.defaults.apply(null, [original].concat(rel))
    doc.sources = _.compact(_.flatten(_.pluck(rel, 'sources')))
    return [ doc ]
  } else {
    return null
  }
}

module.exports = merge
