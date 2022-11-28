import type { Fields, FieldsToInterface } from './field';
import type { Find } from './find';
import { docToFind } from './find';
import type { Connection, Doc } from './mongoose';
import { fieldsToSchema } from './mongoose';
import type { Model } from 'mongoose';
import { connect, ConnectionStates, model, models, Types } from 'mongoose';

export interface Configuration {
  collection: string;
  connection: Connection;
}

export default class CRUD<T extends Fields> {
  private readonly model: Model<Doc<T>>;
  private connection: Awaited<ReturnType<typeof connect>>['connection'] | undefined;

  constructor(private readonly fields: T, private readonly configuration: Configuration) {
    const schema = fieldsToSchema(this.fields);

    Reflect.deleteProperty(models, this.configuration.collection);
    this.model = model<Doc<T>, Model<Doc<T>>>(this.configuration.collection, schema, this.configuration.collection);
  }

  private preventOutsideBoundaries(
    projection: FieldsToInterface<T> | Partial<FieldsToInterface<T>>,
  ): FieldsToInterface<T> {
    const allowedProperties = Object.keys(this.fields);
    const outsideProperties = Object.keys(projection).filter((field) => !allowedProperties.includes(field));

    const draft = projection;
    outsideProperties.forEach((field) => Reflect.deleteProperty(draft, field));

    return draft as FieldsToInterface<T>;
  }

  private isAlive(): true {
    if (!this.connection || (this.connection && this.connection.readyState !== ConnectionStates.connected)) {
      throw new Error('Disconnected');
    }

    return true;
  }

  public async connect(): Promise<CRUD<T>> {
    try {
      const { connection } = await connect(
        `mongodb://${this.configuration.connection.host}:${this.configuration.connection.port}`,
        {
          auth: {
            password: this.configuration.connection.password,
            username: this.configuration.connection.username,
          },
          dbName: this.configuration.connection.database,
        },
      );

      this.connection = connection;
      return this;
    } catch (error) {
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    this.isAlive();

    return this.connection?.close();
  }

  public async create(entry: FieldsToInterface<T>): Promise<Find<T>> {
    this.isAlive();

    const draft = new this.model(this.preventOutsideBoundaries(entry));
    Reflect.set(draft, '_id', new Types.ObjectId());

    const saved = await draft.save();

    return docToFind(saved);
  }
  public async createMany(entries: Array<FieldsToInterface<T>>): Promise<Array<Find<T>>> {
    this.isAlive();
    const saved = await this.model.insertMany(entries.map((entry) => this.preventOutsideBoundaries(entry)));

    return saved.map((entry) => docToFind(entry));
  }

  public async read<P extends Array<keyof T> | undefined>(
    predicated: Partial<FieldsToInterface<T>>,
    projection?: P,
    // @ts-ignore
  ): Promise<(P extends undefined ? Find<T> : Pick<Find<T>, P[number]>) | undefined> {
    this.isAlive();
    const fields = Object.keys(this.fields);
    const selectedFields = projection
      ? Array.from(new Set(projection)).filter((field) => fields.includes(field.toString()))
      : fields;

    const result = await this.model.findOne(this.preventOutsideBoundaries(predicated), selectedFields.join(' ')).exec();

    if (!result) {
      return undefined;
    }

    // @ts-ignore
    return docToFind(result) as P extends undefined ? Find<T> : Pick<Find<T>, P[number]>;
  }
  public async readMany<P extends Array<keyof T> | undefined>(
    predicated: Partial<FieldsToInterface<T>>,
    projection?: P,
    // @ts-ignore
  ): Promise<Array<P extends undefined ? Find<T> : Pick<Find<T>, P[number]>>> {
    this.isAlive();
    const fields = Object.keys(this.fields);
    const selectedFields = projection
      ? Array.from(new Set(projection)).filter((field) => fields.includes(field.toString()))
      : fields;

    const result = await this.model.find(this.preventOutsideBoundaries(predicated), selectedFields).exec();

    if (result && !(result instanceof Array)) {
      // @ts-ignore
      return [docToFind(result)] as Array<P extends undefined ? Find<T> : Pick<Find<T>, P[number]>>;
    }

    if (result) {
      // @ts-ignore
      return result.map((doc) => docToFind(doc)) as Array<P extends undefined ? Find<T> : Pick<Find<T>, P[number]>>;
    }

    return [];
  }

  public async update(
    predicated: Partial<FieldsToInterface<T>>,
    newValues:
      | Partial<FieldsToInterface<T>>
      | ((previousValues: FieldsToInterface<T>) => Partial<FieldsToInterface<T>>),
  ): Promise<{ modifiedCount: number }> {
    this.isAlive();
    let calculatedNewValues: Partial<FieldsToInterface<T>> | undefined = undefined;

    if (typeof newValues === 'function') {
      const result = await this.model.findOne(this.preventOutsideBoundaries(predicated));

      if (result) {
        calculatedNewValues = newValues(result.toObject({ useProjection: true }));
      }
    } else {
      calculatedNewValues = newValues;
    }

    if (calculatedNewValues) {
      const { modifiedCount } = await this.model.updateOne(
        this.preventOutsideBoundaries(predicated),
        this.preventOutsideBoundaries(calculatedNewValues),
      );

      return {
        modifiedCount,
      };
    }

    return {
      modifiedCount: 0,
    };
  }
  public async updateMany(
    predicated: Partial<FieldsToInterface<T>>,
    newValues:
      | Partial<FieldsToInterface<T>>
      | ((previousValues: FieldsToInterface<T>) => Partial<FieldsToInterface<T>>),
  ): Promise<{ modifiedCount: number }> {
    this.isAlive();

    if (typeof newValues === 'function') {
      let modifiedCount = 0;

      const result = await this.model.find(this.preventOutsideBoundaries(predicated));

      for await (const doc of result) {
        const calculatedNewValues = newValues(doc.toObject({ useProjection: true }));

        const toLog = await doc.update(this.preventOutsideBoundaries(calculatedNewValues));
        console.log(toLog);

        modifiedCount += 1;
      }

      return { modifiedCount };
    }

    const { modifiedCount } = await this.model.updateMany(
      this.preventOutsideBoundaries(predicated),
      this.preventOutsideBoundaries(newValues),
    );

    return { modifiedCount };
  }

  public async delete(predicated: Partial<FieldsToInterface<T>>): Promise<{ deletedCount: number }> {
    this.isAlive();
    const { modifiedCount } = await this.model
      .updateOne(this.preventOutsideBoundaries(predicated), {
        $unset: Object.keys(this.fields).reduce(
          (acc, key) => ({
            ...acc,
            [key]: 1,
          }),
          {},
        ),
      })
      .exec();

    return { deletedCount: modifiedCount };
  }
  public async deleteMany(predicated: Partial<FieldsToInterface<T>>) {
    this.isAlive();
    const { modifiedCount } = await this.model
      .updateMany(this.preventOutsideBoundaries(predicated), {
        $unset: Object.keys(this.fields).reduce(
          (acc, key) => ({
            ...acc,
            [key]: 1,
          }),
          {},
        ),
      })
      .exec();

    return { deletedCount: modifiedCount };
  }
}
