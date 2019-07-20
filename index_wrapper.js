function hasExactMatch(doc, searchTerm) {
  return doc.kanji.some(k => k === searchTerm) || doc.readings.some(r => r === searchTerm);
}

class IndexWrapper {
  constructor(flexSearchIndex) {
    this.flexSearchIndex = flexSearchIndex;
  }

  search(searchTerm) {
    const results = this.flexSearchIndex.search(searchTerm);
    return results.sort((a, b) => {
      const aHasExactMatch = hasExactMatch(a, searchTerm);
      const bHasExactMatch = hasExactMatch(b, searchTerm);

      if (aHasExactMatch && !bHasExactMatch) {
        return -1;
      }

      if (bHasExactMatch && !aHasExactMatch) {
        return 1;
      }

      return a.index - b.index;
    }).map(({
      index, kanjiIndex, readingsIndex, ...other
    }) => other);
  }

  serialize() {
    return this.flexSearchIndex.export();
  }
}

module.exports = IndexWrapper;
