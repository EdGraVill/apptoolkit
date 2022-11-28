import type { SchemaDefinitionProperty } from 'mongoose';
import { Schema } from 'mongoose';

export enum Type {
  string,
  number,
  date,
  buffer,
  boolean,
  ObjectId,
}

export interface MapType {
  [Type.ObjectId]: string;
  [Type.boolean]: boolean;
  [Type.buffer]: Buffer;
  [Type.date]: Date;
  [Type.number]: number;
  [Type.string]: string;
}

export const mapTypes = {
  [Type.ObjectId]: Schema.Types.ObjectId,
  [Type.boolean]: Schema.Types.Boolean,
  [Type.buffer]: Schema.Types.Buffer,
  [Type.date]: Schema.Types.Date,
  [Type.number]: Schema.Types.Number,
  [Type.string]: Schema.Types.String,
};

export type FieldProperties<T extends Type = Type> = {
  defaultValue?: MapType[T] | (() => MapType[T]);
  isImmutable?: boolean;
  isIndex?: boolean;
  isRequired?: boolean;
  isUnique?: boolean;
  type: T;
};

export function fieldPropertyToSchemaType<T extends Type>(
  fieldProperties: FieldProperties<T>,
): SchemaDefinitionProperty<MapType[T]> {
  return {
    index: fieldProperties.isIndex,
    required: fieldProperties.isRequired || fieldProperties.isIndex,
    type: mapTypes[fieldProperties.type],
  } as unknown as SchemaDefinitionProperty<MapType[T]>;
}

export type Fields = Record<string, FieldProperties>;

type FieldsRequired<T extends Fields> = {
  [K in keyof T as T[K]['isRequired'] extends true
    ? K
    : T[K]['isIndex'] extends true
    ? K
    : T[K]['isUnique'] extends true
    ? K
    : never]: MapType[T[K]['type']];
};

type FieldsOptionals<T extends Fields> = {
  [K in keyof T as T[K]['isRequired'] extends true
    ? never
    : T[K]['isIndex'] extends true
    ? never
    : T[K]['isUnique'] extends true
    ? never
    : K]?: MapType[T[K]['type']] | undefined;
};

type FieldsInmutables<T extends Fields> = {
  readonly [K in keyof T as T[K]['isImmutable'] extends true ? K : never]: MapType[T[K]['type']];
};

export type FieldsToInterface<T extends Fields> = FieldsRequired<T> & FieldsOptionals<T> & FieldsInmutables<T>;
