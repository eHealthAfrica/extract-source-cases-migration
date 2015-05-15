# extract-source-cases-migration
Extract inlined source case information into dedicated person documents.

Usage
-----

### Node

```js
var transform = require('extract-source-cases-migration')

var contact =
  { _id: '123-abc-567'
  , _rev: '8-3a99b57d89647c15056dfb6a0ae9eb77'
  , doc_type: 'person'
  , version: '0.0.0'
  , contact:
    { sourceCases:
      [
        { id: 'JOHN_DOE'
        , name: 'John aka J. Doe'
        , lastContactDate: '2012-03-29T12:22:41.761Z'
        , phone: '01123 2345678'
        , exposures: [ 'objects' ]
        , relative:
          { name: ''
          , phone: '0112 334455'
          }
        }
      ]
    }
  }

var migration = transform(contact)
```

This will produce the following data structure for `transform`:
```js
{ contact:
  { _id: '123-abc-567'
  , doc_type: 'person'
  , version: '0.0.0'
  , contact:
    { sourceCases:
      [
        { personId: '567-fhg-890'
        , lastContactDate: '2012-03-29T12:22:41.761Z'
        , exposures: [ 'objects' ]
        }
      ]
    }
  , changeLog:
    [
      { user: 'extract-source-cases-migration'
      , timestamp: 1422613414251
      , rev: '8-3a99b57d89647c15056dfb6a0ae9eb77'
      }
    ]
  }
  cases:
  [
    { _id: '567-fgh-890'
    , docType: 'person'
    , version: '1.16.0'
    , createdDate: '2015-03-11T10:45:14.715Z' // now
    , surname: 'Doe'
    , otherNames: 'John aka J.'
    , phoneNumber: '01123 2345678'
    , relative:
      { name: ''
      , phone: '0112 334455'
      }
    , case:
      { _id: 'JOHN_DOE'
      , status: 'unknown'
      }
    , sources:
      [
        { type: 'migration'
        , name: 'extract-source-cases-migration'
        , original: '123-abc-567/source-cases/0'
        , timestamp: 1422613414251
        }
      ]
    }
  ]
}

```

### CLI

```sh
npm install -g extract-source-cases-migration
extract-source-cases-migration http://localhost:5984/mydb
```

Testing
-------

Run the tests with
```sh
npm test
```
