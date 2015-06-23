CHANGE LOG
==========

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/) and is
structured according to [Keep a Changelog](http://http://keepachangelog.com).

---

## 1.3.1 [2015-06-23]
### Fixed
- correctly transfer two-part name from inline source case

## 1.3.0 [2015-06-02]
### Added
- aggregate extracted docs with matching id and name
- normalize id and name for matching
- merge properties of deduplicated docs
- add all sources to meta data
- output help message
- print version
- show spinner when processing
- report amount of docs created, updated, and merged
- option to report table of merged documents
- debug output with table of merged sources

### Changed
- transfer `onsetDate` when given

## 1.2.0 [2015-05-19]
### Added
- extract inlined source cases
- transform original doc
- track meta data inside `sources` and `changeLog`
- split `name` into `surname` and `otherNames`
- cli script
