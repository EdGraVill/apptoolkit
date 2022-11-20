export function globalGet<T>(key: string): T {
  return Reflect.get(globalThis, key) as T;
}

export function globalSet<T>(key: string, value: T): T {
  Reflect.set(globalThis, key, value);

  return globalGet<T>(key);
}
