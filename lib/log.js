'use strict'
function changeLog (user, doc) {
  return (doc.changeLog || []).concat(
    { user: user
    , rev: doc._rev
    , timestamp: Date.now()
    }
  )
}

module.exports = changeLog
