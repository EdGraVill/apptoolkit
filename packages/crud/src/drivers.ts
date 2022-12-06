import type { Fields, FieldsToInterface } from './field';
import type { Find } from './find';
import { MongoConnection, MongoCRUD } from './mongo';

export type Connector = MongoConnection;
export type Driver<S extends Fields> = MongoCRUD<S, FieldsToInterface<S>, Find<S>>;

const mapConnectorWithDriver = {
  [MongoConnection.connectionType]: MongoCRUD,
} as const;

export function loadDriver<S extends Fields>(
  fields: S,
  connection: MongoConnection,
): MongoCRUD<S, FieldsToInterface<S>, Find<S>>;
export function loadDriver<S extends Fields>(fields: S, connection: Connector): Driver<S> {
  const Driver = mapConnectorWithDriver[connection.connectionType];

  return new Driver(fields, connection);
}
