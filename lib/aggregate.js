'use strict'
var create = require('./create')

function normalize(value) {
  return String(value)
    .toUpperCase()
    .split(/\.?\s+/).join(' ')
    .trim()
}

function generateKey (doc) {
  return [doc.id, doc.name].map(normalize).join(' | ')
}

function aggregate (aggregator, doc, parent, index) {
  if (aggregator && doc.id && normalize(doc.id)) {
    var key = generateKey(doc)
      , rel = aggregator[key] || []
      , id  = rel[0] && rel[0]._id
    return aggregator[key] = rel.concat(create(doc, parent, index, id))
  } else {
    return [ create(doc, parent, index, null) ]
  }
}

module.exports = aggregate
