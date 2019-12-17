'use strict';

const fs = require('fs');
const streams = require('./streams');

module.exports = {
  sampleData: consumeSampleData
};

const modelUser = {
  id: 0,
  username: '',
  password: '',
  title: '',
  first_name: '',
  last_name: '',
  gender: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  phone: '',
  email: '',
  rating: 0
};

async function consumeSampleData(path) {
  let filename;

  filename = path + '.avro';
  if (fs.existsSync(filename)) {
    let count = 0;
    const decoder = new Promise((resolve, reject) => {
      streams
        .createAvroDecoder({
          path: filename
        })
        .on('data', (user) => {
          count++;
          // do something with the user
        })
        .on('end', () => resolve())
        .on('error', reject);
    });

    console.log('');
    console.log('Decoding ' + filename);
    const stats = fs.statSync(filename);
    console.log('File size: ' + stats['size'].toLocaleString());
    console.time('decode');
    await decoder;
    console.log(count.toLocaleString() + ' users decoded');
    console.timeEnd('decode');
  }

  const keys = Object.keys(modelUser);

  filename = path + '.tsv';
  if (fs.existsSync(filename)) {
    let count = -1; // Ignore first line contains field names
    const input = fs.createReadStream(filename);
    const splitter = streams
      .splitter({ mapper: (line) => line.split('\t') })
      .on('data', (values) => {
        if (count >= 0) {
          const user = Object.assign({}, modelUser);
          for (let [index, key] of keys) user[key] = values[index];
        }
        count++;
        // do something with user
      });

    console.log('');
    console.log('Decoding ' + filename);
    const stats = fs.statSync(filename);
    console.log('File size: ' + stats['size'].toLocaleString());
    console.time('decode');
    await streams.pipeline(input, splitter);
    console.log(count.toLocaleString() + ' users decoded');
    console.timeEnd('decode');
  }

  filename = path + '.tsv.gz';
  if (fs.existsSync(filename)) {
    let count = -1; // Ignore first line contains field names
    const input = fs.createReadStream(filename);
    const unzip = streams.unzip();
    const splitter = streams
      .splitter({ mapper: (line) => line.split('\t') })
      .on('data', (values) => {
        if (count >= 0) {
          const user = Object.assign({}, modelUser);
          for (let [index, key] of keys) user[key] = values[index];
        }
        count++;
        // do something with user
      });

    console.log('');
    console.log('Decoding ' + filename);
    const stats = fs.statSync(filename);
    console.log('File size: ' + stats['size'].toLocaleString());
    console.time('decode');
    await streams.pipeline(input, unzip, splitter);
    console.log(count.toLocaleString() + ' users decoded');
    console.timeEnd('decode');
  }
}
