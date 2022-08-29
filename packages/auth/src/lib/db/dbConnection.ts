/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CreateIndexesOptions, MongoClient, MongoClientOptions } from 'mongodb';
import { MongoClient as mongodb } from 'mongodb';

const createdIndexes: Record<string, boolean> = ((global as any).createdIndexes = {});

export async function connectToDB(): Promise<MongoClient> {
  const isAlreadyConnected: MongoClient | undefined = (global as any).mongoConnection;

  if (isAlreadyConnected) {
    console.info('Connection restored');

    return isAlreadyConnected;
  }

  try {
    const connection = await mongodb.connect(`${process.env.DB_HOST}/${process.env.APP_NAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as MongoClientOptions);

    (global as any).mongoConnection = connection;

    console.info('Connected to DB');

    return connection;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createIndex(collection: string, index: string, options?: CreateIndexesOptions): Promise<void> {
  const key = `${collection}:${index}`;

  if (!createdIndexes[key]) {
    const connection = await connectToDB();

    await connection
      .db()
      .collection('accounts')
      .createIndex('email', options as CreateIndexesOptions);

    createdIndexes[key] = true;
  }
}
