import type { Collection, Db } from 'mongodb';
import { MongoClient } from 'mongodb';

interface Connection {
  collection: string;
  database: string;
  host: string;
  password?: string;
  port?: string;
  username?: string;
}

export default class MongoConnection {
  public static readonly connectionType = 'Mongo';
  public readonly connectionType = MongoConnection.connectionType;
  public connected = false;
  public readonly client: MongoClient;
  public readonly collection: Collection;
  public readonly db: Db;

  constructor({ collection, database, host, password, port, username }: Connection) {
    const connectionURI = new URL(`mongodb://${host}`);
    connectionURI.port = port ?? '27017';
    connectionURI.username = username ?? '';
    connectionURI.password = password ?? '';

    this.client = new MongoClient(connectionURI.toString(), { connectTimeoutMS: 3000 });
    this.db = this.client.db(database);
    this.collection = this.db.collection(collection);

    this.client.addListener('connectionReady', () => {
      this.connected = true;
    });

    this.client.addListener('connectionClosed', () => {
      this.connected = false;
    });
  }

  public isAlive() {
    if (!this.connected) {
      throw new Error('Disconnected from DB');
    }
  }
}
