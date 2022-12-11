import CRUD, { MongoConnection } from '@apptoolkit/crud';

const Connection = new MongoConnection({
  collection: process.env.DB_COLLECTION ?? 'accounts',
  database: process.env.DB_DATABASE ?? 'accounts',
  host: process.env.DB_HOST ?? 'localhost',
  password: process.env.DB_PASSWORD ?? 'secret',
  username: process.env.DB_USERNAME ?? 'mongoadmin',
});

const Account = new CRUD(
  {
    email: {
      isIndex: true,
      isUnique: true,
      type: CRUD.Type.string,
    },
    firstName: {
      isRequired: true,
      type: CRUD.Type.string,
    },
    isConfirmed: {
      defaultValue: false,
      type: CRUD.Type.boolean,
    },
    lastName: {
      isRequired: true,
      type: CRUD.Type.string,
    },
    password: {
      isRequired: true,
      type: CRUD.Type.string,
    },
    secret: {
      type: CRUD.Type.buffer,
    },
  },
  Connection,
);

export default Account;

export type AccountFields = Parameters<typeof Account['create']>[0];
