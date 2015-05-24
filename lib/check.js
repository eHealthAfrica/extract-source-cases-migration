'use strict'
function needsProcessing (sourceCase) {
  return !sourceCase.personId
}

function check (doc) {
  return (doc &&
          doc.contact &&
          doc.contact.sourceCases &&
          doc.contact.sourceCases.some(needsProcessing)) ? true : false
}

module.exports = check
