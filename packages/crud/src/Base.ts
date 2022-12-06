import type { Fields, FieldsToInterface } from './field';
import type { Find } from './find';

export interface DeleteResponse {
  deletedCount: number;
}
export interface Delete<S extends Fields, I extends FieldsToInterface<S>> {
  (predicated: Partial<I>, dry: true): Promise<[find: I, delte: () => Promise<DeleteResponse>]>;
  (predicated: Partial<I>): Promise<DeleteResponse>;
}
export interface DeleteMany<S extends Fields, I extends FieldsToInterface<S>> {
  (predicated: Partial<I>, dry: true): Promise<[finds: I[], delte: () => Promise<DeleteResponse>]>;
  (predicated: Partial<I>): Promise<DeleteResponse>;
}

export interface UpdateResponse {
  updatedCount: number;
}
export interface Update<S extends Fields, I extends FieldsToInterface<S>> {
  (predicated: Partial<I>, replace: Partial<I>, dry: true): Promise<
    [compare: [current: I, proposal: I], update: () => Promise<UpdateResponse>]
  >;
  (predicated: Partial<I>, replace: Partial<I>): Promise<UpdateResponse>;
  (predicated: Partial<I>, replace: (currentValue: I) => Partial<I>, dry: true): Promise<
    [compare: [current: I, proposal: I], update: () => Promise<UpdateResponse>]
  >;
  (predicated: Partial<I>, replace: (currentValue: I) => Partial<I>): Promise<UpdateResponse>;
}
export interface UpdateMany<S extends Fields, I extends FieldsToInterface<S>> {
  (predicated: Partial<I>, replace: Partial<I>, dry: true): Promise<
    [compare: Array<[current: I, proposal: I]>, update: () => Promise<UpdateResponse>]
  >;
  (predicated: Partial<I>, replace: Partial<I>): Promise<UpdateResponse>;
  (predicated: Partial<I>, replace: (currentValue: I) => Partial<I>, dry: true): Promise<
    [compare: Array<[current: I, proposal: I]>, update: () => Promise<UpdateResponse>]
  >;
  (predicated: Partial<I>, replace: (currentValue: I) => Partial<I>): Promise<UpdateResponse>;
}

export interface CRUDMethods<S extends Fields, I extends FieldsToInterface<S>, F extends Find<S>> {
  connect(): Promise<this>;
  create(entry: I): Promise<F>;
  createMany(entries: I[]): Promise<F[]>;
  delete: Delete<S, I>;
  deleteMany: DeleteMany<S, I>;
  disconnect(): Promise<void>;
  read<P extends Array<keyof S> | undefined>(
    predicated: Partial<I>,
    projection?: P,
    // @ts-ignore
  ): Promise<(P extends undefined ? F : Pick<F, P[number]>) | undefined>;
  readMany<P extends Array<keyof S> | undefined>(
    predicated: Partial<I>,
    projection?: P,
    // @ts-ignore
  ): Promise<Array<P extends undefined ? F : Pick<F, P[number]>>>;
  update: Update<S, I>;
  updateMany: UpdateMany<S, I>;
}
