'use trict'
var _     = require('lodash')
  , Table = require('cli-table')

function start (data) {
  return data.start = Date.now()
}

function stop (data) {
  return data.stop = Date.now()
}

function count (data, docs, tally) {
  if (docs != null) {
    var amounts = docs.map(tally || updatedOrCreated).reduce(addUp, {})
    addUp(data, amounts)
    return amounts
  } else {
    return null
  }
}

function updatedOrCreated (doc) {
  return (doc._rev) ? { updated: 1 } : { created: 1 }
}

function addUp (current, amounts) {
  for (var key in amounts) {
    current[key] = amount(current, key) + amount(amounts, key)
  }
  return current
}

function amount (data, key) {
  return data[key] * 1 || 0
}

function info (data, key, datum) {
  if (datum == null) {
    return data[key]
  } else {
    data[key] = datum
    return datum
  }
}

function table (data, key, columns) {
  var cols = _.unzip(columns)
  return data[key] = { rows: new Table({head: cols[0]}), columns: cols[1] }
}

function rows (data, key, docs) {
  var table = data[key]
  if (table && docs) {
    var items = docs.map(function (doc) {
      return table.columns.map(function (col) {
        return _.get(doc, col, '')
      })
    })
    table.rows.push.apply(table.rows, items)
    return items
  } else {
    return null
  }
}

function render (data, key) {
  var table = data[key]
  if (table) {
    return table.rows.toString()
  } else {
    return null
  }
}

function create () {
  var data = Object.create(null)
    , report = { start:  _.partial(start , data)
               , stop:   _.partial(stop  , data)
               , count:  _.partial(count , data)
               , amount: _.partial(amount, data)
               , info:   _.partial(info  , data)
               , table:  _.partial(table , data)
               , rows:   _.partial(rows  , data)
               , render: _.partial(render, data)
               }

  Object.defineProperty(report, 'duration', { get: function () {
    if (data.start != null) {
      var stop  = data.stop || Date.now()
        , dur   = new Date(stop - data.start)
      return dur.toUTCString().split(' ')[4]
    } else {
      return '00:00:00'
    }
  }})

  Object.defineProperty(report, 'updated', { get: function () {
    return data.updated || 0
  }})

  Object.defineProperty(report, 'created', { get: function () {
    return data.created || 0
  }})

  Object.defineProperty(report, 'total'  , { get: function () {
    return report.created + report.updated
  }})

  return report
}

module.exports = create
