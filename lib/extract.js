'use strict'
var _         = require('lodash')
  , uuid      = require('pouchdb').utils.uuid
  , aggregate = require('./aggregate')

function extract (aggregator, doc, sourceCase, index) {
  if (!sourceCase.personId) {
    var rel = aggregate(aggregator, sourceCase, doc, index)

    if (rel.length === 1) {
      return [ update(sourceCase, rel[0]._id)
             , rel[0]
             ]
    } else {
      return [ update(sourceCase, rel[0]._id) ]
    }

  } else {
    return [ sourceCase ]
  }
}

function update (original, id) {
  var rel = _.omit(original, 'id', 'name', 'phone', 'relative', 'onsetDate')
  rel.personId = id
  return rel
}

function extractSourceCases (doc, aggregator) {
  var sourceCases = doc.contact.sourceCases
    , extracted = _.unzip(sourceCases.map(_.partial(extract, aggregator, doc)))

  return { update: extracted[0]
         , docs: _.compact(extracted[1])
         }
}

module.exports = extractSourceCases
