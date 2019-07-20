const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const AdmZip = require('adm-zip');
const edictIndex = require('./index.js');

function decompress(zipBuffer) {
  const zip = new AdmZip(zipBuffer);
  const hispadicEntry = zip.getEntry('hispadic.utf8');
  const hispadic = zip.readAsText(hispadicEntry);
  return hispadic;
}

async function getEdictUtf8() {
  const cachedFilePath = path.join(__dirname, 'hispadict_utf8.txt');

  try {
    return await fs.readFile(cachedFilePath, 'utf8');
  } catch {
    // Continue to download and convert the file.
  }

  // Download EDICT as compressed EUC-JP file.
  const response = await axios.get(
    'https://sites.google.com/site/hispadic/download/hispadic.zip',
    { responseType: 'arraybuffer' },
  );
  
  // Decompress it
  const zippedHispadicBuffer = new Buffer(response.data);
  const hispadicBuffer = await decompress(zippedHispadicBuffer);

  // Write it to disk for next time.
  await fs.writeFile(cachedFilePath, hispadicBuffer);

  // Stringify it and return.
  return hispadicBuffer.toString('utf8');
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
  const edict = await getEdictUtf8();
  const index = edictIndex.buildIndex(edict);

  printCarResults(index);
}

example().catch((err) => console.warn(err));
