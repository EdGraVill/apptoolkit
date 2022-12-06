export enum Type {
  boolean,
  buffer,
  date,
  double,
  int,
  int64,
  ObjectId,
  string,
}

export interface MapType {
  [Type.boolean]: boolean;
  [Type.buffer]: Buffer;
  [Type.date]: Date;
  [Type.double]: number;
  [Type.int]: number;
  [Type.int64]: bigint;
  [Type.ObjectId]: string;
  [Type.string]: string;
}

export type FieldProperties<T extends Type = Type> = {
  defaultValue?: MapType[T] | (() => MapType[T]);
  isIndex?: boolean;
  isRequired?: boolean;
  isUnique?: boolean;
  type: T;
};

export type Fields = Record<string, FieldProperties>;

type FieldsRequired<T extends Fields> = {
  [K in keyof T as T[K]['defaultValue'] extends MapType[T[K]['type']]
    ? never
    : T[K]['defaultValue'] extends () => MapType[T[K]['type']]
    ? never
    : T[K]['isRequired'] extends true
    ? K
    : T[K]['isIndex'] extends true
    ? K
    : T[K]['isUnique'] extends true
    ? K
    : never]: MapType[T[K]['type']];
};

type FieldsOptionals<T extends Fields> = {
  [K in keyof T as T[K]['defaultValue'] extends MapType[T[K]['type']]
    ? K
    : T[K]['defaultValue'] extends () => MapType[T[K]['type']]
    ? K
    : T[K]['isRequired'] extends true
    ? never
    : T[K]['isIndex'] extends true
    ? never
    : T[K]['isUnique'] extends true
    ? never
    : K]?: MapType[T[K]['type']] | undefined;
};

export type FieldsToInterface<T extends Fields> = FieldsRequired<T> & FieldsOptionals<T>;
