import { MongoClient } from 'mongodb';

class DBClient {
  async connect() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';

    const uri = `mongodb://${host}:${port}`;

    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();

    this.db = client.db(database);
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    const count = await this.db.collection('users').countDocuments();
    return count;
  }

  async nbFiles() {
    const count = await this.db.collection('files').countDocuments();
    return count;
  }
}

const dbClient = new DBClient();
dbClient.connect()
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

export default dbClient;
