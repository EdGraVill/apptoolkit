import CRUD from './CRUD';
import type { Find } from './find';
import { MongoConnection } from './mongo';

// Replace connector to test other drivers
const Connector = MongoConnection;

const connection = new Connector({
  collection: 'test',
  database: 'test',
  host: 'localhost',
  password: 'secret',
  port: '27017',
  username: 'mongoadmin',
});

describe('CRUD', () => {
  describe('Connection', () => {
    describe('connect', () => {
      it('Should connect to database', async () => {
        const Test = new CRUD({ test: { type: CRUD.Type.string } }, connection);

        await expect(Test.connect()).resolves.toBeDefined();
      });

      it('Should not connect to database if host is wrong', async () => {
        const wrongConnection = new Connector({
          collection: 'test',
          database: 'test',
          host: 'lclhst',
          password: 'secret',
          port: '27017',
          username: 'mongoadmin',
        });

        const Test = new CRUD({ test: { type: CRUD.Type.string } }, wrongConnection);

        await expect(Test.connect()).rejects.toThrow();
      });

      it('Should not connect to database if auth failed', async () => {
        const wrongConnection = new Connector({
          collection: 'test',
          database: 'test',
          host: 'localhost',
          password: 'secret',
          port: '27017',
          username: 'mongoadmi',
        });

        const Test = new CRUD({ test: { type: CRUD.Type.string } }, wrongConnection);

        await expect(Test.connect()).rejects.toThrow();
      });

      it('Should return the same instance', async () => {
        const Test = new CRUD({ test: { type: CRUD.Type.string } }, connection);

        await expect(Test.connect()).resolves.toBeInstanceOf(CRUD);
      });
    });

    describe('disconnect', () => {
      it('Should disconnect from database', async () => {
        const Test = new CRUD({ test: { type: CRUD.Type.string } }, connection);

        await Test.connect();

        await expect(Test.disconnect()).resolves.not.toThrow();
        await expect(Test.disconnect()).rejects.toThrowError('Disconnected');
      });

      it('Should throw an error if trying to disconnect without db connected', async () => {
        const Test = new CRUD({ test: { type: CRUD.Type.string } }, connection);

        await expect(Test.disconnect()).rejects.toThrowError('Disconnected');
      });
    });
  });

  describe('Methods', () => {
    const Test = new CRUD(
      {
        defaultValueField: {
          defaultValue: () => new Date(),
          isRequired: true,
          type: CRUD.Type.date,
        },
        indexField: {
          isIndex: true,
          type: CRUD.Type.string,
        },
        regularField: {
          type: CRUD.Type.string,
        },
        requiredField: {
          isRequired: true,
          type: CRUD.Type.int,
        },
        uniqueField: {
          isUnique: true,
          type: CRUD.Type.string,
        },
      },
      connection,
    );

    afterAll(async () => {
      await Test.disconnect();
    });

    beforeAll(async () => {
      await Test.connect();
    });

    describe('create', () => {
      const created: Find<Record<never, never>>[] = [];

      afterAll(async () => {
        for await (const find of created) {
          await find.delete();
        }
      });

      // [MAIN FUNCTIONALITY]
      it('Should create a single entry', async () => {
        await expect(
          (async () => {
            const find = await Test.create({
              indexField: new Date().toString(),
              requiredField: parseInt((new Date().getTime() / 1000000).toString()),
              uniqueField: new Date().toISOString(),
            });

            created.push(find);
          })(),
        ).resolves.not.toThrow();
      });
      // [ARGUMENTS]
      // it('Should throw an error if no arguments are provided', async () => {});
      // it('Should throw an error if has a duplicated unique field', async () => {});
      // it('Should throw an error if the required fields are missing', async () => {});
      // it('Should throw an error if the index fields are missing', async () => {});
      // it('Should ignore fields that are not defined', async () => {});
      // it('Should use the default value', async () => {});
      // [SIDE EFFECTS]
      // it('Should throw an error if connection with database is lost', async () => {});
      // [RETURN]
      // it('Should return a Find object', async () => {});
    });
  });
});
