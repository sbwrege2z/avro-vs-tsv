'use strict';

const util = require('util');
const avro = require('avsc');
const zlib = require('zlib');
const snappy = require('snappy');
const stream = require('stream');
const split2 = require('split2');
const through2 = require('through2');

const pipeline = util.promisify(stream.pipeline);

module.exports = {
  csv,
  tsv,
  minify,
  gzip,
  unzip,
  stringify,
  objectify,
  splitter,
  passThrough,
  createAvroEncoder,
  createAvroDecoder,
  transform: through2,

  fieldsHeader,
  pipeline
};

function gzip(params) {
  const { options } = params || {};
  return zlib.createGzip(options);
}

function unzip(params) {
  const { options } = params || {};
  return zlib.createUnzip(options);
}

function createAvroEncoder(params) {
  params = Object.assign({ schema: {} }, params);
  const {
    path,
    schema: { infer, explicit },
    options = { codec: 'deflate' }
  } = params;
  let type = null;
  if (infer) type = avro.Type.forValue(infer);
  else if (!explicit) throw new Error('No inferred or explicit schema supplied');
  else type = avro.Type.forValue(explicit);
  if (options.codec === 'snappy' && !options.codecs) {
    options.codecs = {
      snappy: snappy.compress
    };
  }
  if (path) return new avro.createFileEncoder(path, type, options);
  return new avro.streams.BlockEncoder(type, options);
}

function createAvroDecoder(params) {
  params = Object.assign({ schema: {} }, params);
  const {
    path,
    options,
    schema: { infer, explicit }
  } = params;
  if (options && options.codec === 'snappy' && !options.codecs) {
    options.codecs = {
      snappy: snappy.uncompress
    };
  }
  if (path) return new avro.createFileDecoder(path, options);
  let type = null;
  if (infer) type = avro.Type.forValue(infer);
  else if (!explicit) throw new Error('No path or schema specified');
  else type = avro.Type.forValue(explicit);
  return new avro.streams.BlockDecoder(type, options);
}

function splitter(params) {
  const { matcher, mapper, options } = params || {};
  return split2(matcher, mapper, options);
}

function passThrough(params) {
  const { objectMode = false } = params || {};
  return stream.PassThrough({
    readableObjectMode: objectMode,
    writableObjectMode: objectMode
  });
}

// INPUT: OBJECTS
// OUTPUT: STRINGIFIED OBJECTS
function stringify() {
  return through2.obj((obj, enc, callback) => callback(null, JSON.stringify(obj) + '\n'));
  /*
  return through2.obj(function(obj, enc, callback) {
    this.push(JSON.stringify(obj) + '\n');
    callback();
  });
  */
}

// INPUT: STRINGIFIED OBJECTS
// OUTPUT: OBJECTS
function objectify() {
  return through2.obj((str, enc, callback) => callback(null, JSON.parse(str)));
}

// INPUT: OBJECT
// OUTPUT: VALUES SPERATED BY SEPERATOR
function seperate(params) {
  let rows = 0;
  const { seperator = '\t' } = params || {};
  return through2.obj((obj, enc, callback) => {
    callback(
      null,
      (rows++ === 0 ? fieldsHeader(obj, seperator) : '') + Object.values(obj).join(seperator) + '\n'
    );
  });
}

// INPUT: OBJECT
// OUTPUT: VALUES SPERATED BY SEPERATOR AND DECORATED BY DECORATOR
function minify(params) {
  const { decorator = '', seperator = '\t' } = params || {};
  if (!decorator) return seperate({ seperator });
  let rows = 0;
  return through2.obj((obj, enc, callback) => {
    const str = [];
    for (let value of Object.values(obj)) {
      value = value ? value.toString() : '';
      if (value.includes(decorator)) value = value.replace(decorator, decorator + decorator);
      if (value.includes(seperator)) str.push(decorator + value + decorator);
      else str.push(value);
    }
    callback(null, (rows++ === 0 ? fieldsHeader(obj, seperator) : '') + str.join(seperator) + '\n');
  });
}

function fieldsHeader(obj, seperator) {
  return (
    Object.keys(obj)
      .map((key) => key.toUpperCase())
      .join(seperator) + '\n'
  );
}

function tsv() {
  return seperate({ seperator: '\t' });
}

function csv() {
  return minify({ decorator: '"', seperator: ',' });
}
