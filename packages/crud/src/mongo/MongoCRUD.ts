import type { Collection, Db, Document, MongoClient, ServerHeartbeatFailedEvent, WithId } from 'mongodb';
import { ObjectId } from 'mongodb';

import type { CRUDMethods } from '../Base';
import type { Fields, FieldsToInterface } from '../field';
import { Type } from '../field';
import type { Find } from '../find';
import { docToFind } from '../find';
import type MongoConnection from './MongoConection';

const mapBsonTypes = {
  [Type.boolean]: 'bool',
  [Type.buffer]: 'binData',
  [Type.date]: 'date',
  [Type.double]: 'double',
  [Type.int]: 'int',
  [Type.int64]: 'long',
  [Type.ObjectId]: 'objectId',
  [Type.string]: 'string',
} as const;

export default class MongoCRUD<S extends Fields, I extends FieldsToInterface<S>, F extends Find<S>>
  implements CRUDMethods<S, I, F>
{
  private readonly client: MongoClient;
  private readonly collection: Collection;
  private readonly db: Db;

  constructor(private readonly fields: S, private readonly connection: MongoConnection) {
    this.client = this.connection.client;
    this.collection = this.connection.collection;
    this.db = this.connection.db;

    Object.keys(this).map((key) => {
      const mop = this[key as keyof typeof this];
      if (typeof mop === 'function') {
        mop.bind(this);
      }
    });
  }

  private preventOutsideBoundaries(projection: WithId<Document>): I;
  private preventOutsideBoundaries(projection: I): I;
  private preventOutsideBoundaries(projection: Partial<I>): Partial<I>;
  private preventOutsideBoundaries(projection: I | Partial<I> | WithId<Document>): I | Partial<I> {
    const allowedProperties = Object.keys(this.fields);
    const outsideProperties = Object.keys(projection).filter((field) => !allowedProperties.includes(field));

    if (!outsideProperties.length) {
      return projection as I;
    }

    const draft = { ...projection };
    outsideProperties.forEach((field) => Reflect.deleteProperty(draft, field));

    return draft as Partial<I>;
  }

  private toFind(doc: I | WithId<Document>, _id: ObjectId): F {
    return docToFind(
      this.preventOutsideBoundaries(doc as I),
      // this.selfUpdater(id) as Parameters<typeof docToFind>[1],
      async (newValues: Partial<FieldsToInterface<S>>) => {
        const { modifiedCount } = await this.collection.updateOne({ _id }, { $set: newValues });

        return { updatedCount: modifiedCount };
      },
      async () => {
        const { deletedCount } = await this.collection.deleteOne({ _id });

        return { deletedCount };
      },
    ) as F;
  }

  private arrayToProjection(projection?: Array<keyof S>): Record<keyof S, 0 | 1> {
    const keys = Object.keys(this.fields);

    const projectionObject = keys.reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: 1,
      }),
      {} as Record<keyof S, 0 | 1>,
    );

    if (!projection) {
      return projectionObject;
    }

    keys.forEach((key) => {
      if (!projection.includes(key)) {
        projectionObject[key as keyof S] = 0;
      }
    });

    return projectionObject;
  }

  private async prepareCollection() {
    const collections = await this.db.listCollections().toArray();
    const isNew = !collections.find(({ name }) => name === this.collection.collectionName);

    const keys = Object.keys(this.fields);
    const required = keys.filter((key) => this.fields[key as keyof S]?.isRequired);
    const uniqueAndIndexes = keys.filter(
      (key) => this.fields[key as keyof S]?.isIndex || this.fields[key as keyof S]?.isUnique,
    );
    const schemaRequires = Array.from(new Set([...required, ...uniqueAndIndexes]));
    const validator = {
      $jsonSchema: {
        bsonType: 'object',
        properties: keys.reduce(
          (acc, key) => ({
            ...acc,
            [key]: {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              bsonType: mapBsonTypes[this.fields[key as keyof S]!.type],
            },
          }),
          {},
        ),
        ...(schemaRequires.length
          ? {
              required: schemaRequires,
            }
          : {}),
      },
    };

    if (isNew) {
      await this.db.createCollection(this.collection.collectionName, { validator });
    } else {
      await this.db.command({
        collMod: this.collection.collectionName,
        validator,
      });
    }

    const createIndexes = uniqueAndIndexes.map((key) => {
      const field = this.fields[key as keyof S];

      return this.collection.createIndex(key, { unique: !!field?.isUnique });
    });

    for await (const res of createIndexes) {
      res;
    }
  }

  private setDefaultValues(entry: I): I;
  private setDefaultValues(entry: I[]): I[];
  private setDefaultValues(entry: I | I[]): I | I[] {
    const fieldsWithDefaultValues = Object.keys(this.fields).filter((key) => !!this.fields[key]?.defaultValue);

    if (!fieldsWithDefaultValues.length) {
      return entry;
    }

    if (entry instanceof Array) {
      return entry.map((ent) => {
        const clone = { ...ent };

        fieldsWithDefaultValues.forEach((key) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const { defaultValue } = this.fields[key]!;

          // @ts-ignore
          clone[key as keyof I] = typeof defaultValue === 'function' ? defaultValue() : defaultValue;
        });

        return clone;
      });
    }

    const clone = { ...entry };

    fieldsWithDefaultValues.forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { defaultValue } = this.fields[key]!;

      // @ts-ignore
      clone[key as keyof I] = typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    });

    return clone;
  }

  public async connect(): Promise<this> {
    await new Promise<void>(async (resolve, reject) => {
      const listener = (error: ServerHeartbeatFailedEvent) => {
        this.client.close();
        reject(error.failure);
      };

      this.client.once('serverHeartbeatFailed', listener);
      try {
        await this.client.connect();
      } catch (error) {
        reject(error);
      }
      resolve();
    });

    await this.prepareCollection();

    return this;
  }

  public async disconnect() {
    this.connection.isAlive();

    await this.client.close();
  }

  public create: CRUDMethods<S, I, F>['create'] = async (entry) => {
    this.connection.isAlive();

    const clone = { ...entry };
    Object.entries(this.fields)
      .filter((keyValue) => !!keyValue[1].defaultValue)
      .forEach(([key, value]) => {
        const defaultValue = value.defaultValue;
        const computedValue = typeof defaultValue === 'function' ? defaultValue() : defaultValue;

        // @ts-ignore
        clone[key] = computedValue;
      });

    const { insertedId } = await this.collection.insertOne(this.setDefaultValues(this.preventOutsideBoundaries(clone)));
    return this.toFind(entry, insertedId);
  };

  public createMany: CRUDMethods<S, I, F>['createMany'] = async (entries) => {
    this.connection.isAlive();

    const entriesWithId: Array<I & { _id: ObjectId }> = entries.map((entry) => ({
      _id: new ObjectId(),
      ...this.setDefaultValues(this.preventOutsideBoundaries(entry)),
    }));

    await this.collection.insertMany(entriesWithId);

    return entriesWithId.map((entry) => this.toFind(entry, entry._id));
  };

  // @ts-ignore Since read is using a exotic type system to compose the result
  public read: CRUDMethods<S, I, F>['read'] = async (predicated, projection) => {
    this.connection.isAlive();

    const find = await this.collection.findOne(this.preventOutsideBoundaries(predicated), {
      projection: this.arrayToProjection(projection),
    });

    if (!find) {
      return undefined;
    }

    return this.toFind(find, find._id);
  };

  // @ts-ignore Since readMany is using a exotic type system to compose the result
  public readMany: CRUDMethods<S, I, F>['readMany'] = async (predicated, projection) => {
    this.connection.isAlive();

    const find = await this.collection
      .find(this.preventOutsideBoundaries(predicated), {
        projection: this.arrayToProjection(projection),
      })
      .toArray();

    if (!find.length) {
      return [];
    }

    return find.map((doc) => this.toFind(doc, doc._id));
  };

  // @ts-ignore Since update is using a exotic type system to compose the result
  public update: CRUDMethods<S, I, F>['update'] = async (predicated, replace, dry) => {
    this.connection.isAlive();

    if (!dry && typeof replace !== 'function') {
      const { modifiedCount } = await this.collection.updateOne(predicated, replace);

      return { updatedCount: modifiedCount };
    }

    const docToUpdate = await this.collection.findOne(predicated);

    if (!docToUpdate) {
      if (dry) {
        return [[{} as I, {} as I], async () => ({ updatedCount: 0 })];
      }

      return { updatedCount: 0 };
    }

    const boundedDoc = this.preventOutsideBoundaries(docToUpdate);
    const computedReplace = this.preventOutsideBoundaries(
      typeof replace === 'function' ? replace(boundedDoc) : replace,
    );

    if (dry) {
      return [
        [boundedDoc, { ...boundedDoc, ...computedReplace } as I],
        async () => {
          return this.update(predicated, computedReplace);
        },
      ];
    }

    const { modifiedCount } = await this.collection.updateOne({ _id: docToUpdate._id }, computedReplace);

    return { updatedCount: modifiedCount };
  };

  // @ts-ignore Since updateMany is using a exotic type system to compose the result
  public updateMany: CRUDMethods<S, I, F>['updateMany'] = async (predicated, replace, dry) => {
    this.connection.isAlive();

    if (!dry && typeof replace !== 'function') {
      const { modifiedCount } = await this.collection.updateMany(predicated, replace);

      return { updatedCount: modifiedCount };
    }

    const docsToUpdate = await this.collection.find(predicated).toArray();

    if (!docsToUpdate.length) {
      if (dry) {
        return [[], async () => ({ updatedCount: 0 })];
      }

      return { updatedCount: 0 };
    }

    const boundedDocs = docsToUpdate.map(this.preventOutsideBoundaries) as I[];

    if (typeof replace !== 'function') {
      if (dry) {
        return [
          boundedDocs.map((doc) => [doc, { ...doc, ...replace } as I]),
          async () => this.updateMany(predicated, replace),
        ];
      }

      return this.updateMany(predicated, replace);
    }

    const computedReplaces = boundedDocs.map(replace);

    const updateAll = async () => {
      let updatedCount = 0;

      const updaters = boundedDocs.map((doc, ix) => this.update(doc, computedReplaces[ix] as Partial<I>));

      for await (const update of updaters) {
        const { updatedCount: uc } = update;

        updatedCount += uc;
      }

      return { updatedCount };
    };

    if (dry) {
      return [boundedDocs.map((doc) => [doc, { ...doc, ...replace } as I]), updateAll];
    }

    return updateAll();
  };

  // @ts-ignore Since delete is using a exotic type system to compose the result
  public delete: CRUDMethods<S, I, F>['delete'] = async (predicated, dry) => {
    this.connection.isAlive();

    if (!dry) {
      const { deletedCount } = await this.collection.deleteOne(predicated);

      return { deletedCount };
    }

    const toBeDeleted = await this.collection.findOne(predicated);

    if (!toBeDeleted) {
      return [{} as I, async () => ({ deletedCount: 0 })];
    }

    return [this.preventOutsideBoundaries(toBeDeleted), async () => this.delete(predicated)];
  };

  // @ts-ignore Since deleteMany is using a exotic type system to compose the result
  public deleteMany: CRUDMethods<S, I, F>['deleteMany'] = async (predicated, dry) => {
    this.connection.isAlive();

    if (!dry) {
      const { deletedCount } = await this.collection.deleteMany(predicated);

      return { deletedCount };
    }

    const toBeDeleted = await this.collection.find(predicated).toArray();

    if (!toBeDeleted.length) {
      return [[], async () => ({ deletedCount: 0 })];
    }

    return [toBeDeleted.map(this.preventOutsideBoundaries), async () => this.deleteMany(predicated)];
  };
}
