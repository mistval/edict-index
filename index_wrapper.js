const wordFrequency = require('./frequency.json');


function getFrequencyScore(doc) {
  const frequency = wordFrequency[doc.kanji[0]];
  if (frequency === undefined) {
    return Number.MAX_SAFE_INTEGER;
  }

  return frequency;
}

function calculateMatchQuality(doc, searchTerm) {
  if (doc.kanji.some(k => k === searchTerm) || doc.readings.some(r => r === searchTerm)) {
    return 10;
  }

  if (doc.kanji.some(k => k.indexOf(searchTerm) !== -1
    || doc.readings.some(r => r.indexOf(searchTerm) !== -1))) {
      return 5;
  }

  return 0;
}

class IndexWrapper {
  constructor(flexSearchIndex) {
    this.flexSearchIndex = flexSearchIndex;
  }

  search(searchTerm, limit) {
    const results = this.flexSearchIndex.search(searchTerm, limit).map(result => ({
      ...result,
      matchQuality: calculateMatchQuality(result, searchTerm),
    }));

    return results.sort((a, b) => {
      if (a.matchQuality !== b.matchQuality) {
        return b.matchQuality - a.matchQuality;
      }

      return getFrequencyScore(a) - getFrequencyScore(b);
    }).map(({
      definitionsIndex, index, kanjiIndex, readingsIndex, ...other
    }) => other);
  }
}

module.exports = IndexWrapper;
