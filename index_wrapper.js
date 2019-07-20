const wordFrequency = require('./frequency.json');

function hasExactMatch(doc, searchTerm) {
  return doc.kanji.some(k => k === searchTerm) || doc.readings.some(r => r === searchTerm);
}

function getFrequencyScore(doc) {
  const frequency = wordFrequency[doc.kanji[0]];
  if (frequency === undefined) {
    return Number.MAX_SAFE_INTEGER;
  }

  return frequency;
}

class IndexWrapper {
  constructor(flexSearchIndex) {
    this.flexSearchIndex = flexSearchIndex;
  }

  search(searchTerm, limit) {
    const results = this.flexSearchIndex.search(searchTerm, limit);
    return results.sort((a, b) => {
      const aHasExactMatch = hasExactMatch(a, searchTerm);
      const bHasExactMatch = hasExactMatch(b, searchTerm);

      if (aHasExactMatch && !bHasExactMatch) {
        return -1;
      }

      if (bHasExactMatch && !aHasExactMatch) {
        return 1;
      }

      return getFrequencyScore(a) - getFrequencyScore(b);
    }).map(({
      definitionsIndex, index, kanjiIndex, readingsIndex, ...other
    }) => other);
  }
}

module.exports = IndexWrapper;
