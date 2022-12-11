export const isNotProd = process.env.NODE_ENV !== 'production';

export function autoFiller<T>(fillWith: T): undefined;
export function autoFiller<T, D>(fillWith: T, defaultWith: D): T | D;
export function autoFiller<T, D>(fillWith: T, defaultWith?: D): T | D | undefined {
  if (isNotProd && process.env.NEXT_PUBLIC_DEV_AUTOFILL === 'true') {
    return fillWith;
  }

  return defaultWith ?? undefined;
}
