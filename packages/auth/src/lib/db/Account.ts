import { connectToDB } from './dbConnection';
import type { Document, MongoClient } from 'mongodb';

interface Credentials {
  email: string;
  password: string;
}

interface MFA {
  is2FAEnabled: boolean;
  secret: string;
}

interface Timestamp {
  createdAt: Date;
  lastLogin: Date;
  modifiedAt: Date;
}

interface AccountData extends Credentials, MFA, Timestamp {}

export default class Account {
  private static readonly key = Symbol();
  private static readonly collectionName = 'account';
  private static connection: MongoClient;

  private static async openConnection() {
    if (!this.connection) {
      try {
        this.connection = await connectToDB();
      } catch (error) {
        throw new Error(); // TODO
      }
    }

    return this.connection;
  }

  public static async getAccount(email: string): Promise<Account> {
    await this.openConnection();

    try {
      const account = await this.connection.db().collection(this.collectionName).findOne({ email });

      if (!account) {
        throw new Error(); // TODO
      }

      Reflect.set(account, Account.key, Account.key);

      return new Account(account);
    } catch (error) {
      throw new Error(); // TODO
    }
  }

  private constructor(private readonly accountDocument: Document) {
    if (!Reflect.get(this.accountDocument, Account.key)) {
      throw new Error('Do not initialize this class. Use Account.getAccount() instead'); // TODO
    }
  }
}
