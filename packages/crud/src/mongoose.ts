import type { FieldProperties, Fields, FieldsToInterface } from './field';
import { fieldPropertyToSchemaType } from './field';
import type { Document } from 'mongoose';
import { Schema } from 'mongoose';

export type Doc<T extends Fields> = Document & FieldsToInterface<T>;

export interface Connection {
  database: string;
  host: string;
  password: string;
  port: number;
  username: string;
}

export function fieldsToSchema(fields: Fields) {
  return new Schema(
    {
      ...Object.keys(fields).reduce(
        (acc, curr) => ({
          ...acc,
          [curr]: fieldPropertyToSchemaType(fields[curr] as FieldProperties),
        }),
        {},
      ),
      __v: {
        select: false,
        type: Schema.Types.Number,
      },
      _id: {
        select: false,
        type: Schema.Types.ObjectId,
      },
      timestamps: {
        select: false,
        type: {
          created: Schema.Types.Date,
          updated: Schema.Types.Date,
        },
      },
    },
    {
      strict: false,
      timestamps: {
        createdAt: 'timestamps.created',
        updatedAt: 'timestamps.updated',
      },
    },
  );
}
