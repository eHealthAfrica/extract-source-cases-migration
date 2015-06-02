#!/usr/bin/env node
var nopt    = require('nopt')
  , chalk   = require('chalk')
  , url     = require('url')
  , PouchDB = require('pouchdb')
  , Spinner = require('cli-spinner').Spinner
  , _       = require('lodash')
  , digest  = require('../lib')
  , merge   = require('../lib/merge')
  , report  = require('../lib/report')

PouchDB.plugin(require('pouchdb-migrate'))

var manifest = require('../package.json')
  , knownOptions = { 'help' : Boolean
                   , 'version' : Boolean
                   , 'allow-duplicates' : Boolean
                   , 'report' : Boolean
                   , 'debug' : Boolean
                   }
  , shortHands   = { 'h' : ['--help']
                   , 'v' : ['--version']
                   , 'r' : ['--report']
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
  console.log('  -r, --report              print exhaustive report to stdout')
  console.log('  --debug                   print debug info')
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

function mergedAndSources (doc) {
  return { merged: 1
         , sources: doc.sources && doc.sources.length
         }
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
    , spinner    = new Spinner(chalk.blue('%s Extracting documents...'))
    , aggregator = (options['allow-duplicates']) ? null : Object.create(null)
    , reporter   = report()

  if (options.report) {
    reporter.table('merged docs', [ ['Case Id'    , 'case.id']
                                  , ['Surname'    , 'surname']
                                  , ['Other Names', 'otherNames']
                                  , ['Phone'      , 'phoneNumber']
                                  ]
                  )
  }

  if (options.debug) {
    reporter.table('merged sources', [ ['Case Id' , 'doc.id']
                                     , ['Name'    , 'doc.name']
                                     , ['Phone'   , 'doc.phone']
                                     , ['Relative', 'doc.relative']
                                  ]
                  )
  }

  reporter.start()
  spinner.start()

  database
    .migrate(function (doc) {
      var results = digest(doc, aggregator)
      reporter.count(results)
      return results
    })
    .then(function (migration) {
      if (aggregator) {
        var rels = _.mapKeys( aggregator
                            , function (rel, key) { return rel[0]._id }
                            )
        spinner.stop(true)
        spinner = new Spinner(chalk.blue('%s Merging duplicates...'))
        spinner.start()
        return database.migrate(function (doc) {
          var results = merge(doc, rels)
          reporter.count(results, mergedAndSources)
          reporter.rows('merged docs', results)
          if (options.debug) {
            reporter.rows('merged sources', results && results[0].sources)
          }
          return results
        })
      }
    })
    .then(function (migration) {
      spinner.stop(true)
      reporter.stop()
      console.log(chalk.green('Done.'))
      console.log(chalk.grey('Duration:', reporter.duration))
      console.log( 'Updated:', reporter.updated
                 , 'Created:', reporter.created
                 , 'Total:'  , reporter.total
                 )
      var merged = reporter.amount('merged')
      if (merged) {
        console.log('Merged:', merged, 'from', reporter.amount('sources'))
        console.log(reporter.render('merged docs'))
        if (options.debug) {
          console.log('')
          console.log('===========================================================================')
          console.log('')
          console.log(reporter.render('merged sources'))
        }
      }
      process.exit()
    })
    .catch(function (error) {
      spinner.stop(true)
      abort(error)
    })
}
