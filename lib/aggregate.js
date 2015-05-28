'use strict'
var create = require('./create')

function normalize(value) {
  return value
    .toUpperCase()
    .split(/\.?\s+/).join(' ')
    .trim()
}

function generateKey (doc) {
  return [doc.id, doc.name].map(normalize).join(' | ')
}

function aggregate (aggregator, doc, parent, index) {
  var created = [ create(doc, parent, index) ]
  if (aggregator) {
    var key = generateKey(doc)
    aggregator[key] = (aggregator[key] || []).concat(created)
    return aggregator[key]
  } else {
    return created
  }
}

module.exports = aggregate
