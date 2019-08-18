const dotenv = require('dotenv');
const path = require('path');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const { NODE_ENV } = process.env;

dotenv.config({
  path: path.resolve(__dirname, `./.env.${NODE_ENV ? NODE_ENV : 'development'}`),
});

const url = process.env.MONGODB_CONNECTION_STRING;

let db = null;
module.exports = async () => {
  if (db) {
    return db;
  }
  const client = await MongoClient.connect(url, { useNewUrlParser: true });
  db = client.db();
  return db;
};
