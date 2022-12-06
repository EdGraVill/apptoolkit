import type { DeleteResponse, UpdateResponse } from './Base';
import type { Fields, FieldsToInterface } from './field';

export type Find<T extends Fields, I = FieldsToInterface<T>> = I & {
  delete(): Promise<void>;
  update(newValues: Partial<I> | ((previousValues: I) => Partial<I>)): Promise<Find<T, I>>;
};

export function docToFind<S extends Fields>(
  doc: FieldsToInterface<S>,
  updater: (newValues: Partial<FieldsToInterface<S>>) => Promise<UpdateResponse>,
  deleter: () => Promise<DeleteResponse>,
): Find<S> {
  const find = Object.assign(doc, {
    async delete() {
      const { deletedCount } = await deleter();

      if (!deletedCount) {
        throw new Error('Error deleting');
      }
    },
    async update(
      newValues:
        | Partial<FieldsToInterface<S>>
        | ((previousValues: FieldsToInterface<S>) => Partial<FieldsToInterface<S>>),
    ) {
      let calculatedNewValues: Partial<FieldsToInterface<S>>;

      if (typeof newValues === 'function') {
        calculatedNewValues = newValues(doc);
      } else {
        calculatedNewValues = newValues;
      }

      const { updatedCount } = await updater(calculatedNewValues);

      if (!updatedCount) {
        throw new Error('Error updating');
      }

      return { ...find, ...calculatedNewValues };
    },
  });

  return find as Find<S>;
}
