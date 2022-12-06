import type { CRUDMethods } from './Base';
import type { Connector, Driver } from './drivers';
import { loadDriver } from './drivers';
import type { Fields, FieldsToInterface } from './field';
import { Type } from './field';
import type { Find } from './find';

export default class CRUD<S extends Fields> implements CRUDMethods<S, FieldsToInterface<S>, Find<S>> {
  public static readonly Type = Type;

  private readonly driver: Driver<S>;

  constructor(private readonly fields: S, private readonly connection: Connector) {
    this.driver = loadDriver(this.fields, this.connection);

    this.disconnect = this.driver.disconnect.bind(this.driver);
    this.create = this.driver.create.bind(this.driver);
    this.createMany = this.driver.createMany.bind(this.driver);
    this.read = this.driver.read.bind(this.driver);
    this.readMany = this.driver.readMany.bind(this.driver);
    this.update = this.driver.update.bind(this.driver);
    this.updateMany = this.driver.updateMany.bind(this.driver);
    this.delete = this.driver.delete.bind(this.driver);
    this.deleteMany = this.driver.deleteMany.bind(this.driver);
  }

  public async connect() {
    await this.driver.connect();
    return this;
  }

  public readonly disconnect: CRUDMethods<S, FieldsToInterface<S>, Find<S>>['disconnect'];
  public readonly create: CRUDMethods<S, FieldsToInterface<S>, Find<S>>['create'];
  public readonly createMany: CRUDMethods<S, FieldsToInterface<S>, Find<S>>['createMany'];
  public readonly read: CRUDMethods<S, FieldsToInterface<S>, Find<S>>['read'];
  public readonly readMany: CRUDMethods<S, FieldsToInterface<S>, Find<S>>['readMany'];
  public readonly update: CRUDMethods<S, FieldsToInterface<S>, Find<S>>['update'];
  public readonly updateMany: CRUDMethods<S, FieldsToInterface<S>, Find<S>>['updateMany'];
  public readonly delete: CRUDMethods<S, FieldsToInterface<S>, Find<S>>['delete'];
  public readonly deleteMany: CRUDMethods<S, FieldsToInterface<S>, Find<S>>['deleteMany'];
}
