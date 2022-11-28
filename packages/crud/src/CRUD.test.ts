import type { Configuration } from './CRUD';
import CRUD from './CRUD';
import { Type } from './field';
import type { Connection } from './mongoose';
import type mongoose from 'mongoose';
import { connect, Types } from 'mongoose';

const connection: Connection = {
  database: 'test',
  host: 'localhost',
  password: 'secret',
  port: 27017,
  username: 'mongoadmin',
};

const fields = {
  anotherField: {
    type: Type.number,
  },
  immutableField: {
    isImmutable: true,
    type: Type.string,
  },
  indexField: {
    isIndex: true,
    type: Type.string,
  },
  testField: {
    isRequired: true,
    type: Type.string,
  },
  uniqueField: {
    isUnique: true,
    type: Type.number,
  },
} as const;

const configuration: Configuration = {
  collection: 'test',
  connection,
};

describe('CRUD', () => {
  describe('Connection', () => {
    describe('connect', () => {
      it('Should connect to database', async () => {
        const Test = new CRUD(fields, configuration);

        await expect(Test.connect()).resolves.toBeDefined();
      });

      it('Should not connect to database if host is wrong', async () => {
        const Test = new CRUD(fields, { collection: 'test', connection: { ...connection, host: 'lclhst' } });

        await expect(Test.connect()).rejects.toThrow();
      });
    });

    describe('disconnect', () => {
      it('Should disconnect from database', async () => {
        const Test = new CRUD(fields, configuration);

        await Test.connect();

        await expect(Test.disconnect()).resolves.not.toThrow();
        await expect(Test.disconnect()).rejects.toThrowError('Disconnected');
      });

      it('Should throw an error if trying to disconnect without db connected', async () => {
        const Test = new CRUD(fields, configuration);

        await expect(Test.disconnect()).rejects.toThrowError('Disconnected');
      });
    });
  });

  describe('Methods', () => {
    const Test = new CRUD(fields, configuration);
    let rawConnection: mongoose.Connection;
    const value = 'testValue';
    const expectedEntry = {
      testField: value,
    };

    afterAll(async () => {
      await rawConnection.close();
    });

    afterEach(async () => {
      await rawConnection.db.dropCollection(configuration.collection);
    });

    beforeAll(async () => {
      const { connection: internalConnection } = await connect(`mongodb://${connection.host}:${connection.port}`, {
        auth: {
          password: connection.password,
          username: connection.username,
        },
        dbName: connection.database,
      });
      rawConnection = internalConnection;

      await Test.connect();
    });

    describe('create', () => {
      it('Should create a single entry', async () => {
        await expect(Test.create(expectedEntry)).resolves.not.toThrow();

        const find = await rawConnection.models[configuration.collection].findOne(expectedEntry).lean().exec();

        expect(find).toEqual(expectedEntry);
      });

      it('Should create an entry that only match with the described fields', async () => {
        const inputEntry = {
          randomField: value,
          testField: value,
        };

        await expect(Test.create(inputEntry)).resolves.not.toHaveProperty('randomField');

        const find = await rawConnection.models[configuration.collection].findOne(expectedEntry).lean().exec();

        expect(find).toEqual(expectedEntry);
      });
    });

    describe('createMany', () => {
      it('Should create multiple entries', async () => {
        const count = Math.ceil(Math.random() * 100);

        await expect(Test.createMany(Array.from({ length: count }).map(() => expectedEntry))).resolves.not.toThrow();

        const find = await rawConnection.models[configuration.collection].find(expectedEntry).lean().exec();

        expect(find.length).toEqual(count);
      });

      it('Should create an entries that only match with the described fields', async () => {
        const count = Math.ceil(Math.random() * 100);
        const inputEntry = {
          randomField: value,
          testField: value,
        };

        await expect(Test.createMany(Array.from({ length: count }).map(() => inputEntry))).resolves.not.toThrow();

        const find = await rawConnection.models[configuration.collection].find(expectedEntry).lean().exec();

        expect(find.length).toEqual(count);
      });
    });

    describe('read', () => {
      it('Should read a single entry', async () => {
        await rawConnection.model('test').create({ ['_id']: new Types.ObjectId(), ...expectedEntry });

        const result = await Test.read(expectedEntry);

        expect(result).toHaveProperty('testField', value);
      });

      it('Should return undefined if the entry does not exist', async () => {
        await rawConnection.model('test').create({ ['_id']: new Types.ObjectId(), ...expectedEntry });

        const result = await Test.read({ testField: 'otherValue' });

        expect(result).toBeUndefined();
      });

      it('Should read a single entry and only the fields selected', async () => {
        await rawConnection.db
          .collection('test')
          .insertOne({ ['_id']: new Types.ObjectId(), ...expectedEntry, anotherField: 20 });

        const result = await Test.read(expectedEntry, ['anotherField']);

        expect(result).not.toHaveProperty('testField');
        expect(result).toHaveProperty('anotherField');
      });

      it('Should not be able of getting a value that is not defined in the fields even if it exist in the database', async () => {
        const id = new Types.ObjectId();
        await rawConnection
          .model('test')
          .create({ ['_id']: id, ...expectedEntry, anotherField: 20, undefinedField: new Date() });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await Test.read(expectedEntry, ['anotherField', 'undefinedField'] as any);

        expect(result).not.toHaveProperty('testField');
        expect(result).not.toHaveProperty('undefinedField');
        expect(result).toHaveProperty('anotherField');

        const stored = await rawConnection.model('test').findById(id);

        console.log(stored);

        expect(stored).toBeDefined();
        expect(stored).toHaveProperty('undefinedField');
      });

      it('Should read a multiple entries', async () => {
        const count = Math.ceil(Math.random() * 100);
        const entries = Array.from({ length: count }).map(() => ({ ['_id']: new Types.ObjectId(), ...expectedEntry }));
        await rawConnection.model('test').create(entries);

        const result = await Test.readMany(expectedEntry);

        expect(result).toHaveLength(count);
      });
    });
  });
});
