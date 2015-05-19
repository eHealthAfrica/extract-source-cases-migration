# extract-source-cases-migration
Extract inlined source case information into dedicated person documents.

[![Build Status](https://magnum.travis-ci.com/eHealthAfrica/extract-source-cases-migration.svg?token=Xm4EKuRzMq3zwKYpneZz)](https://magnum.travis-ci.com/eHealthAfrica/extract-source-cases-migration)

Usage
-----

### Node

```js
var transform = require('extract-source-cases-migration')

var contact =
  { _id: '00ae40fe-7b6f-4cea-df66-e00b59713944'
  , _rev: '8-3a99b57d89647c15056dfb6a0ae9eb77'
  , doc_type: 'person'
  , version: '0.0.0'
  , contact:
    { sourceCases:
      [
        { id: 'qz0255'
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

var docs = transform(contact)
```

This will produce the following data structure for `docs`:
```js
[
  // first doc is the transformed contact

  { _id: '00ae40fe-7b6f-4cea-df66-e00b59713944'
  , _rev: '8-3a99b57d89647c15056dfb6a0ae9eb77'
  , doc_type: 'person'
  , version: '1.16.0'
  , contact:
    { sourceCases:
      [
        { personId: 'fdbe63ec2cf62e484922c6f4203b5695'
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
,
  // remaining docs are the extracted cases

  { _id: 'fdbe63ec2cf62e484922c6f4203b5695'
  , doc_type: 'person'
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
    { id: 'qz0255'
    , status: 'unknown'
    }
  , sources:
    [
      { type: 'migration'
      , name: 'extract-source-cases-migration'
      , origin: '00ae40fe-7b6f-4cea-df66-e00b59713944/contact/source-cases/0'
      , timestamp: 1422613414251
      }
    ]
  }
]

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
