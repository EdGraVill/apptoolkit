# CRUD

Easy way to interact with a database to make simple queries with CRUD operations alike.

## API

```typescript
import CRUD from '@apptoolkit/crud'

// Create an instance of CRUD
const Accounts = new CRUD(fields, configuration)
```

### `Field`

Fields is a `[name]: FieldProperties` object that represents the properties of the fields to access with the instance.

> **NOTE:** Several instances can access the same database's collection. But the instance only be allowed to CRUD over the declared fields

**For Example**

If the stored document looks like:
```json
{
  "_id": "6384e2200ffc26044c7e25c7",
  "name": "John",
  "phone": "555-555-555",
  "email": "john@example.com"
}
```
And the instance is like:
```ts
const Users = new CRUD({
  name: { type: Type.string },
  email: { type: Type.string },
})
```
Phone field will not be available
```ts
const user = await Users.read({ email: 'john@example.com' });
user.name // John
user.email // john@example.com
user.phone // undefined
```

### `Find`

When read or readMany is called. Both will return a Find object. It includes the projected values along with the following functions:

**`Find.update()`:** Allows to update right away.

```ts
const user = await Users.read({ email: 'john@example.com' });
user.name // John

const updatedUser = await user.update({ name: 'John H.' });
updatedUser.name // John H.
```

### connect
### disconnect
### create
### createMany
### read
### readMany
### update
### updateMany
### delete
### deleteMany

## Test Plan

```
  Connection
    connect
      [MAIN FUNCTIONALITY]  
        ✓ Should connect to database
      [ARGUMENTS]
        ✓ Should not connect to database if host is wrong
        ✓ Should not connect to database if auth failed
      [SIDE EFFECTS]
          Should create a connection instance for each CRUD instance (TODO)
      [RETURN]
        ✓ Should return the same instance
    disconnect
      [MAIN FUNCTIONALITY]  
        ✓ Should disconnect from database
      [ARGUMENTS]
      [SIDE EFFECTS]
        ✓ Should throw an error if trying to disconnect without db connected
          Should only disconnect the current connection without close other instance's connections (TODO)
      [RETURN]
  Methods
    create
      [MAIN FUNCTIONALITY]
          Should create a single entry
      [ARGUMENTS]
          Should throw an error if no arguments are provided
          Should throw an error if has a duplicated unique field
          Should throw an error if the required fields are missing
          Should throw an error if the index fields are missing
          Should ignore fields that are not defined
          Should use the default value
      [SIDE EFFECTS]
          Should throw an error if connection with database is lost
      [RETURN]
          Should return a Find object
    createMany
      [MAIN FUNCTIONALITY]
          Should crate the expected ammount of entries
      [ARGUMENTS]
          Should throw an error if any of the entries has no arguments are provided and do not insert anything
          Should throw an error if any of the entries has a duplicated unique field and do not insert anything
          Should throw an error if any of the entries has the required fields are missing and do not insert anything
          Should throw an error if any of the entries has the index fields are missing and do not insert anything
          Should throw an error if any of the entries has the immutable fields are missing and do not insert anything
          Should ignore fields that are not defined
          Should use the default value
      [SIDE EFFECTS]
          Should throw an error if connection with database is lost
      [RETURN]
          Should return an array of Find objects
    read
      [MAIN FUNCTIONALITY]
          Should return an existing entry
          Should return undefined if the database has not the entry
      [ARGUMENTS]
          Should only query to database with the already specified fields
          Should only read the provided projection
          Should omit projections that are not defined as fields
      [SIDE EFFECTS]
          Should throw an error if connection with database is lost
      [RETURN]
          Should return a Find object
          Should return a Find object with the pojected fields
    readMany
      [MAIN FUNCTIONALITY]
          Should return an array of existing entry
          Should return an empty array if any document meet the query criteria
      [ARGUMENTS]
          Should only query to database with the already specified fields
          Should only read the provided projection
          Should omit projections that are not defined as fields
      [SIDE EFFECTS]
          Should throw an error if connection with database is lost
      [RETURN]
          Should return an array of Find object
          Should return an array of Find object with the pojected fields
    update
      [MAIN FUNCTIONALITY]
      [ARGUMENTS]
      [SIDE EFFECTS]
          Should throw an error if connection with database is lost
      [RETURN]
    updateMany
      [MAIN FUNCTIONALITY]
      [ARGUMENTS]
      [SIDE EFFECTS]
          Should throw an error if connection with database is lost
      [RETURN]
    delete
      [MAIN FUNCTIONALITY]
      [ARGUMENTS]
      [SIDE EFFECTS]
          Should throw an error if connection with database is lost
      [RETURN]
    deleteMany
      [MAIN FUNCTIONALITY]
      [ARGUMENTS]
      [SIDE EFFECTS]
          Should throw an error if connection with database is lost
      [RETURN]
  Find
    update
      [MAIN FUNCTIONALITY]
      [ARGUMENTS]
      [SIDE EFFECTS]
          Should throw an error if connection with database is lost
      [RETURN]
```

### Required env
