# edict-index

Build and search an index from EDICT/EDICT2 or other EDICT-like dictionary files.

## Usage

If you have a dictionary file as a string, you can build an index and search it like this:

```js
const EdictIndex = require('edict-index');

const index = EdictIndex.buildIndex(EDICT2_AS_STRING); // This takes a long time so you should only do it once.
const results = index.search('十六夜');
console.log(JSON.stringify(results, null, 2));
```

This prints the following:

```json
[
  {
    "kanji": [
      "十六夜"
    ],
    "readings": [
      "いざよい"
    ],
    "glosses": [
      {
        "tags": [
          "n"
        ],
        "seeAlso": [],
        "definition": "sixteen-day-old moon"
      }
    ],
    "matchType": 100,
    "frequencyRank": 36431
  }
]
```

For examples that show how to obtain, decompress, and convert a dictionary file, see:

* [example_edict2.js](https://github.com/mistval/edict-index/blob/master/example_edict2.js)
* [example_hispadic.js](https://github.com/mistval/edict-index/blob/master/example_hispadic.js)

`matchType` is an enum. The values can be accessed via `const { MatchType } = require('edict-index');`. The values are:

```js
module.exports = {
  KANJI_OR_KANA_EXACT: 100,
  KANJI_OR_KANA_SUBSTRING: 75,
  DEFINITION_EXACT: 50,
  DEFINITION_SUBSTRING: 25,
  FUZZY: 1,
};
```

The `frequencyRank` is determined using a word frequency list in the module. This is used for sorting results. If the word is not in the frequency list, its rank will be `Number.MAX_SAFE_INTEGER`.

This module uses FlexSearch to index and search the dictionary. You can access the FlexSearch index directly if you need to `const { flexSearchIndex } = EdictIndex.buildIndex(EDICT2_AS_STRING);`.
