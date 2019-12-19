'use strict';

const avro = require('avsc');
const casual = require('casual');

const maxInt = Math.pow(2, 31) - 1;
const maxLong = Number.MAX_SAFE_INTEGER;

const enums = {
  suits: ['Clubs', 'Diamonds', 'Hearts', 'Spades'],
  colors: ['Red', 'Green', 'Blue', 'Yellow', 'Orange', 'Purple'],
  genders: ['Male', 'Female'],
  levels: ['High', 'Medium', 'Low'],
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
};

casual.define('user', () => {
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

casual.define('foo', () => {
  return {
    int1: casual.integer(-1 * maxInt, maxInt),
    int2: casual.integer(-1 * maxInt, maxInt),
    int3: casual.integer(-1 * maxInt, maxInt),
    int4: casual.integer(-1 * maxInt, maxInt),
    int5: casual.integer(-1 * maxInt, maxInt),
    long1: casual.integer(-1 * maxLong, maxLong),
    long2: casual.integer(-1 * maxLong, maxLong),
    long3: casual.integer(-1 * maxLong, maxLong),
    long4: casual.integer(-1 * maxLong, maxLong),
    long5: casual.integer(-1 * maxLong, maxLong),
    float1: Math.random() * maxInt,
    float2: Math.random() * maxInt,
    float3: Math.random() * maxInt,
    float4: Math.random() * maxInt,
    float5: Math.random() * maxInt,
    double1: Math.random() * maxLong,
    double2: Math.random() * maxLong,
    double3: Math.random() * maxLong,
    double4: Math.random() * maxLong,
    double5: Math.random() * maxLong,
    bool1: casual.coin_flip,
    bool2: casual.coin_flip,
    bool3: casual.coin_flip,
    bool4: casual.coin_flip,
    bool5: casual.coin_flip,
    suit: casual.random_element(enums.suits),
    color: casual.random_element(enums.colors),
    gender: casual.random_element(enums.genders),
    level: casual.random_element(enums.levels),
    weekday: casual.random_element(enums.weekdays)
  };
});

const models = {
  user: {
    name: 'User',
    avro: {
      type: 'record',
      fields: [
        { name: 'id', type: 'long' },
        { name: 'username', type: 'string' },
        { name: 'password', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' },
        { name: 'gender', type: 'string' },
        { name: 'city', type: 'string' },
        { name: 'state', type: 'string' },
        { name: 'zip', type: 'string' },
        { name: 'country', type: 'string' },
        { name: 'phone', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'rating', type: 'int' }
      ]
    },
    new: {
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
    },
    get random() {
      return casual.user;
    }
  },
  foo: {
    name: 'Foo',
    avro: {
      type: 'record',
      fields: [
        { name: 'int1', type: 'int' },
        { name: 'int2', type: 'int' },
        { name: 'int3', type: 'int' },
        { name: 'int4', type: 'int' },
        { name: 'int5', type: 'int' },
        { name: 'long1', type: 'long' },
        { name: 'long2', type: 'long' },
        { name: 'long3', type: 'long' },
        { name: 'long4', type: 'long' },
        { name: 'long5', type: 'long' },
        { name: 'float1', type: 'float' },
        { name: 'float2', type: 'float' },
        { name: 'float3', type: 'float' },
        { name: 'float4', type: 'float' },
        { name: 'float5', type: 'float' },
        { name: 'double1', type: 'double' },
        { name: 'double2', type: 'double' },
        { name: 'double3', type: 'double' },
        { name: 'double4', type: 'double' },
        { name: 'double5', type: 'double' },
        { name: 'bool1', type: 'boolean' },
        { name: 'bool2', type: 'boolean' },
        { name: 'bool3', type: 'boolean' },
        { name: 'bool4', type: 'boolean' },
        { name: 'bool5', type: 'boolean' },
        { name: 'suit', type: { type: 'enum', symbols: enums.suits } },
        { name: 'color', type: { type: 'enum', symbols: enums.colors } },
        { name: 'gender', type: { type: 'enum', symbols: enums.genders } },
        { name: 'level', type: { type: 'enum', symbols: enums.levels } },
        { name: 'weekday', type: { type: 'enum', symbols: enums.weekdays } }
      ]
    },
    new: {
      int1: 0,
      int2: 0,
      int3: 0,
      int4: 0,
      int5: 0,
      long1: 0,
      long2: 0,
      long3: 0,
      long4: 0,
      long5: 0,
      float1: 0,
      float2: 0,
      float3: 0,
      float4: 0,
      float5: 0,
      double1: 0,
      double2: 0,
      double3: 0,
      double4: 0,
      double5: 0,
      bool1: false,
      bool2: false,
      bool3: false,
      bool4: false,
      bool5: false,
      suit: null,
      color: null,
      gender: null,
      level: null,
      weekday: null
    },
    get random() {
      return casual.foo;
    }
  }
};

for (let model of Object.values(models)) {
  if (!model.avro) {
    model.avro = avro.Type.forValue(model.new);
    console.log('Schema for ' + model.name + ':');
    console.log(JSON.stringify(model.avro.schema()));
  } else if (!(model.avro instanceof avro.Type)) {
    model.avro = avro.Type.forSchema(model.avro);
  }
}

module.exports = models;
