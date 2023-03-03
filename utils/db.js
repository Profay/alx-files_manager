const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(url, { useNewUrlParser: true });
    this.db = null;
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db();
      console.log('DBClient: MongoDB connection established');
    } catch (error) {
      console.error(`DBClient: Failed to connect to MongoDB: ${error}`);
      throw error;
    }
  }

  async close() {
    try {
      await this.client.close();
      console.log('DBClient: MongoDB connection closed');
    } catch (error) {
      console.error(`DBClient: Failed to close MongoDB connection: ${error}`);
      throw error;
    }
  }

  isAlive() {
    return this.db !== null;
  }

  async nbUsers() {
    if (!this.isAlive()) return 0;
    const collection = this.db.collection('users');
    const count = await collection.countDocuments();
    return count;
  }

  async nbFiles() {
    if (!this.isAlive()) return 0;
    const collection = this.db.collection('files');
    const count = await collection.countDocuments();
    return count;
  }
}

const dbClient = new DBClient();
dbClient.connect();

module.exports = dbClient;
