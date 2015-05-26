#!/usr/bin/env node
var nopt    = require('nopt')
  , chalk   = require('chalk')
  , url     = require('url')
  , PouchDB = require('pouchdb')
  , Spinner = require('cli-spinner').Spinner
  , digest  = require('../lib')

PouchDB.plugin(require('pouchdb-migrate'))

var manifest = require('../package.json')
  , knownOptions = { 'help' : Boolean
                   , 'version' : Boolean
                   , 'allow-duplicates' : Boolean
                   }
  , shortHands   = { 'h' : ['--help']
                   , 'v' : ['--version']
                   , 'A' : ['--allow-duplicates']
                   }
  , options      = nopt(knownOptions, shortHands)

function printVersion () {
  console.log(manifest.version)
}

function showHelp () {
  var name = Object.keys(manifest.bin)[0]
  console.log('Usage:', name, '[options]', '<database>')
  console.log('')
  console.log('Options:')
  console.log('  -v, --version             print version')
  console.log('  -h, --help                show help message')
  console.log('  -A, --allow-duplicates    do not aggregate duplicates')
  console.log('')
  console.log('Examples:')
  console.log(' ', name, 'http://localhost:5984/persons')
  console.log(' ', name, '-A', 'https://user:pw@some.db.net/persons')
}

function abort (message) {
  console.error(chalk.red('Error:', message))
  process.exit(1)
}

function parseUrl (arg) {
  if (!arg) {
    abort('Missing required argument <database>')
  }

  arg = url.parse(arg)
  if (!arg.host) {
    abort('Invalid argument given')
  }
  return arg.href
}

if (options.version) {
  printVersion()
  process.exit()
}

if (options.help) {
  showHelp()
  process.exit()
}

options.database = parseUrl(options.argv.remain[0])
if (options.database) {
  var database   = new PouchDB(options.database)
    , spinner    = new Spinner(chalk.blue('%s Migrating database...'))
    , aggregator = (options.allowDuplicates) ? null : {}

  spinner.start()
  database
    .migrate(function (doc) {
      return digest(doc, aggregator)
    })
    .then(function () {
      spinner.stop(true)
      process.exit()
    })
    .catch(function (error) {
      spinner.stop(true)
      abort(error)
    })
}
