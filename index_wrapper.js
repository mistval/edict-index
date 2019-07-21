const wordFrequency = require('./frequency.json');
const MatchType = require('./match_type.js');

function calculateFrequencyRank(doc) {
  const frequency = wordFrequency[doc.kanji[0]];
  if (frequency === undefined) {
    return Number.MAX_SAFE_INTEGER;
  }

  return frequency;
}

function definitionContains(doc, searchFor) {
  const searchForLowercase = searchFor.toLowerCase();

  return doc.glosses.some((gloss) => {
    const definition = gloss.definition.toLowerCase();
    return definition.indexOf(searchForLowercase) !== -1;
  });
}

function definitionExact(doc, searchFor) {
  const searchForLowercase = searchFor.toLowerCase();

  return doc.glosses.some((gloss) => {
    const definition = gloss.definition.toLowerCase();
    return definition === searchForLowercase;
  });
}

function kanjiOrKanaExact(doc, searchFor) {
  return doc.kanji.some(k => k === searchFor) || doc.readings.some(r => r === searchFor);
}

function kanjiOrKanaContains(doc, searchFor) {
  return doc.kanji.some(
    k => k.indexOf(searchFor) !== -1,
  ) || doc.readings.some(
    r => r.indexOf(searchFor) !== -1,
  );
}

function calculateMatchType(doc, searchTerm) {
  if (kanjiOrKanaExact(doc, searchTerm)) {
    return MatchType.KANJI_OR_KANA_EXACT;
  }

  if (kanjiOrKanaContains(doc, searchTerm)) {
      return MatchType.KANJI_OR_KANA_SUBSTRING;
  }

  if (definitionExact(doc, searchTerm)) {
    return MatchType.DEFINITION_EXACT;
  }

  if (definitionContains(doc, searchTerm)) {
    return MatchType.DEFINITION_SUBSTRING;
  }

  return MatchType.FUZZY;
}

class IndexWrapper {
  constructor(flexSearchIndex) {
    this.flexSearchIndex = flexSearchIndex;
  }

  search(searchTerm, limit) {
    const results = this.flexSearchIndex.search(searchTerm, limit).map(result => ({
      ...result,
      matchType: calculateMatchType(result, searchTerm),
      frequencyRank: calculateFrequencyRank(result),
    }));

    return results.sort((a, b) => {
      if (a.matchType !== b.matchType) {
        return b.matchType - a.matchType;
      }

      return a.frequencyRank - b.frequencyRank;
    }).map(({
      definitionsIndex, index, kanjiIndex, readingsIndex, ...other
    }) => other);
  }
}

module.exports = IndexWrapper;
