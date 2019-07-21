/* eslint import/no-extraneous-dependencies: 0 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const EdictIndex = require('./index.js');

async function getFJDictUtf8() {
  const cachedFilePath = path.join(__dirname, 'fjdict_utf8.txt');

  try {
    return await fs.readFile(cachedFilePath, 'utf8');
  } catch (err) {
    // Continue to download and convert the file.
  }

  // Download FJDict as UTF8 file.
  console.log('Downloading FJDict from http://dico.fj.free.fr/fj.utf');
  const response = await axios.get('http://dico.fj.free.fr/fj.utf');
  const dictText = response.data;

  // Write it to disk for next time.
  await fs.writeFile(cachedFilePath, dictText);

  // Stringify it and return.
  return dictText.toString('utf8');
}

function printCarResults(index) {
  const results = index.search('車').slice(0, 5);

  console.log('Results for \u001b[32m車\u001b[0m\n');

  results.forEach((result) => {
    console.log(`- \u001b[32m${result.kanji.join(', ')}\u001b[0m (${result.readings.join(', ')})`);
    result.glosses.forEach((gloss) => {
      console.log(`-- ${gloss.tags.length > 0 ? `(${gloss.tags.join(', ')})` : ''} ${gloss.definition}`);
    });

    console.log('');
  });
}

async function example() {
  const fjDict = await getFJDictUtf8();
  const index = EdictIndex.buildIndex(fjDict);

  printCarResults(index);
}

example().catch(err => console.warn(err));
