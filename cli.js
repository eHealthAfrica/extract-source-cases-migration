#!/usr/bin/env node

var url = process.argv[2]
if (!url) throw('Please specify a database URL')

var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-migrate'))

var migration = require('./')
var db = new PouchDB(url)

db
  .migrate(migration, { live: true })
  .then(function(response) {
    console.log(response)
  })
  .catch(function(error) {
    console.error(error)
    console.error(error.stack)
  })
