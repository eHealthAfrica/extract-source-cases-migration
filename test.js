var transform = require('./')
  , it = require('tape')
  , chai = require('tape-chai')

it('returns transformed original', function(expect) {
  var result = transform({_id: '123-cdef-678'})
  expect.deepProperty(result, 'contact._id', '123-cdef-678')
  expect.end()
})
