const axios = require('axios');
const fs = require('fs').promises;
const Iconv = require('iconv').Iconv;
const path = require('path');
const zlib = require('zlib');
const edictIndex = require('./index.js');

function decompress(gzippedBuffer) {
  return new Promise((fulfill, reject) => {
    zlib.unzip(gzippedBuffer, (err, result) => {
      if (err) {
        return reject(err);
      }

      fulfill(result);
    });
  });
}

async function getEdictUtf8() {
  const cachedFilePath = path.join(__dirname, 'edict_utf8.txt');

  try {
    return await fs.readFile(cachedFilePath, 'utf8');
  } catch {
    // Continue to download and convert the file.
  }

  // Download EDICT as compressed EUC-JP file.
  const response = await axios.get(
    'http://ftp.monash.edu/pub/nihongo/edict2.gz',
    { responseType: 'arraybuffer' },
  );
  
  // Decompress it
  const gzippedEdictEucJpBuffer = new Buffer(response.data);
  const edictEucJpBuffer = await decompress(gzippedEdictEucJpBuffer);

  // Convert it to UTF-8
  const converter = new Iconv('EUC-JP', 'UTF-8');
  const edictUtf8Buffer = converter.convert(edictEucJpBuffer);

  // Write it to disk for next time.
  await fs.writeFile(cachedFilePath, edictUtf8Buffer);

  // Stringify it and return.
  return edictEucJpBuffer.toString('utf8');
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
