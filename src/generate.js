'use strict';

const fs = require('fs');
const casual = require('casual');
const streams = require('./streams');

module.exports = {
  sampleData: generateSampleData
};

const model = {
  user: {
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
  }
};

casual.define('user', function() {
  return {
    id: casual.integer(1000000, 9999999),
    username: casual.username,
    password: casual.password,
    title: casual.name_prefix,
    first_name: casual.first_name,
    last_name: casual.last_name,
    gender: Math.floor(Math.random() * 2 === 1) ? 'M' : 'F',
    city: casual.city,
    state: casual.state_abbr,
    zip: casual.zip(5),
    country: casual.country_code,
    phone: casual.phone,
    email: casual.email,
    rating: casual.integer(0, 6)
  };
});

async function generateSampleData(users) {
  /*
      Define the streams
  */
  const input = streams
    .passThrough({ objectMode: true })
    .on('data', (user) => passThroughUsers.push(user))
    .on('end', () => passThroughUsers.end());
  const passThroughUsers = streams.passThrough({ objectMode: true });
  const passThroughTsv = streams.passThrough({ objectMode: false });
  const tsv = streams
    .tsv()
    .on('data', (str) => passThroughTsv.push(str))
    .on('end', () => passThroughTsv.end());
  const gzip = streams.gzip();
  const encoder = streams.createAvroEncoder({
    schema: { infer: casual.user },
    //options: { codec: 'snappy' }
    //options: { codec: 'null' }
    options: { codec: 'deflate' }
  });
  const subdir = './data';
  //const subdir = './data/_' + users.toLocaleString();
  if (!fs.existsSync(subdir)) fs.mkdirSync(subdir);
  const outputTsv = fs.createWriteStream(subdir + '/sample.tsv');
  const outputZip = fs.createWriteStream(subdir + '/sample.tsv.gz');
  const outputAvro = fs.createWriteStream(subdir + '/sample.avro');

  /*
      Define the pipelines
  */
  const pipelines = [];
  pipelines.push(streams.pipeline(input, tsv, outputTsv));
  pipelines.push(streams.pipeline(passThroughTsv, gzip, outputZip));
  pipelines.push(streams.pipeline(passThroughUsers, encoder, outputAvro));

  /*
      Push sample data
  */
  for (let i = 1; i <= users; i++) {
    if (i % 1000 === 0) console.log(i);
    input.push(casual.user);
  }
  input.end();

  /*
      Wait for the pipelines to complete
  */
  await Promise.all(pipelines);
}
