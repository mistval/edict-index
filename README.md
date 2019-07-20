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
    ]
  }
]
```

For examples that show how to obtain, decompress, and convert a dictionary file, see:

* [example_edict2.js](https://github.com/mistval/edict-index/blob/master/example_edict2.js)
* [example_hispadic.js](https://github.com/mistval/edict-index/blob/master/example_hispadic.js)

## Discussion

This module uses FlexSearch to index and search the dictionary. You can access the FlexSearch index directly if you need to `EdictIndex.buildIndex(EDICT2_AS_STRING).flexSearchIndex`.
