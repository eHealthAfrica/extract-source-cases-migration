'use strict'
function splitName (fullName) {
  var names = {}

  if (fullName) {
    var tokens = fullName.split(/\s+/)
    if (tokens.length > 1) {
      names.otherNames = tokens.slice(0, -1).join(' ')
      names.surname    = tokens.splice(-1)[0]
    } else {
      names.otherNames = tokens[0]
    }
  }

  return names
}

module.exports = splitName
