const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function tryAutoStartMongo() {
  const possiblePaths = [
    process.env.MONGOD_PATH,
    'C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe',
    'mongod'
  ].filter(Boolean);

  const mongodPath = possiblePaths.find((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });

  if (!mongodPath) {
    return false;
  }

  const dbDir = path.resolve(__dirname, '..', 'data', 'db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  console.log(`Auto-starting local MongoDB server from ${mongodPath}...`);
  try {
    const mongoProcess = spawn(mongodPath, ['--dbpath', dbDir, '--port', '27017'], {
      detached: true,
      stdio: 'ignore'
    });
    mongoProcess.unref();
    return true;
  } catch (err) {
    console.error(`Failed to auto-start MongoDB: ${err.message}`);
    return false;
  }
}

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inventory_db';

  try {
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // If local MongoDB is not running, attempt to auto-start it
    if (
      (error.message.includes('ECONNREFUSED') || error.message.includes('server selection')) &&
      (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost'))
    ) {
      console.log('Local MongoDB not running. Attempting to launch background MongoDB instance...');
      const started = tryAutoStartMongo();
      if (started) {
        console.log('Waiting 3 seconds for MongoDB instance to initialize...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
        try {
          const conn = await mongoose.connect(mongoUri);
          console.log(`MongoDB Connected: ${conn.connection.host}`);
          return conn;
        } catch (retryError) {
          console.error(`MongoDB retry connection failed: ${retryError.message}`);
          process.exit(1);
        }
      }
    }

    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
