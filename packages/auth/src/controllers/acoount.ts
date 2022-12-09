import CRUD, { MongoConnection } from '@apptoolkit/crud';

const Connection = new MongoConnection({
  collection: 'accounts',
  database: 'accounts',
  host: 'localhost',
  password: 'secret',
  username: 'mongoadmin',
});

const Account = new CRUD(
  {
    email: {
      isIndex: true,
      isUnique: true,
      type: CRUD.Type.string,
    },
    isConfirmed: {
      defaultValue: false,
      type: CRUD.Type.boolean,
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
