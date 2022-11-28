import type { Fields, FieldsToInterface } from './field';
import type { Doc } from './mongoose';

export type Find<T extends Fields> = FieldsToInterface<T> & {
  update(
    newValues:
      | Partial<FieldsToInterface<T>>
      | ((previousValues: FieldsToInterface<T>) => Partial<FieldsToInterface<T>>),
  ): Promise<Find<T>>;
};

export function docToFind<T extends Fields>(doc: Doc<T>): Find<T> {
  const find = Object.assign(doc.toObject({ useProjection: true }) as FieldsToInterface<T>, {
    async update(
      newValues:
        | Partial<FieldsToInterface<T>>
        | ((previousValues: FieldsToInterface<T>) => Partial<FieldsToInterface<T>>),
    ) {
      let calculatedNewValues: Partial<FieldsToInterface<T>>;

      if (typeof newValues === 'function') {
        calculatedNewValues = newValues(doc.toObject({ useProjection: true }));
      } else {
        calculatedNewValues = newValues;
      }

      await doc.update(calculatedNewValues).exec();

      return { ...find, ...calculatedNewValues };
    },
  });

  return find as Find<T>;
}
