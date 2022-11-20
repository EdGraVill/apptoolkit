import { globalGet, globalSet } from '../util';
import type { CreateIndexesOptions, MongoClient, MongoClientOptions } from 'mongodb';
import { MongoClient as mongodb } from 'mongodb';

const MongoConnectionKey = 'MongoConnection';

export async function connectToDB(): Promise<MongoClient> {
  const isAlreadyConnected = globalGet<MongoClient | undefined>(MongoConnectionKey);

  if (isAlreadyConnected) {
    console.info('Connection restored');

    return isAlreadyConnected;
  }

  try {
    const connection = await mongodb.connect(`${process.env.DB_HOST}/${process.env.APP_NAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as MongoClientOptions);

    globalSet(MongoConnectionKey, connection);

    console.info('Connected to DB');

    return connection;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

type StoredIndexes = Record<string, true>;
const StoredIndexesKey = 'StoredIndexes';

export async function createIndex(collection: string, index: string, options?: CreateIndexesOptions): Promise<void> {
  const key = `${collection}:${index}`;

  const storedIndexes = globalGet<StoredIndexes>(StoredIndexesKey);

  if (!storedIndexes[key]) {
    const connection = await connectToDB();

    await connection
      .db()
      .collection(collection)
      .createIndex(index, options as CreateIndexesOptions);

    storedIndexes[key] = true;
    globalSet(StoredIndexesKey, storedIndexes);
  }
}
