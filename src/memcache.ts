// deno-lint-ignore no-explicit-any
type IgnoreAny = any;

export type CacheEntity = {
  key: string;
  obj: IgnoreAny;
};

/**
 * Checks if a key exists in the cache.
 * @param key - The key to check.
 * @returns A boolean indicating whether the key exists in the cache.
 */
export function has(key: string): boolean {
  const gc = openCache();
  return gc.find((v) => v.key === key) !== undefined;
}

/**
 * Retrieves the value associated with the specified key from the cache.
 *
 * @template T - The type of the value to retrieve.
 * @param key - The key of the value to retrieve.
 * @returns The value associated with the specified key, or undefined if the key does not exist in the cache.
 */
export function get<T>(key: string): T | undefined {
  const gc = openCache();
  if (!has(key)) {
    return undefined;
  }
  const cached = gc.find((v) => v.key === key);
  return cached?.obj as T;
}

/**
 * Puts a value into the cache with the specified key.
 * If the key already exists, the value will be updated.
 *
 * @param key - The key to associate with the value.
 * @param obj - The value to be stored in the cache.
 */
export function put(key: string, obj: IgnoreAny) {
  const gc = openCache();
  if (!has(key)) {
    gc.push({
      key: key,
      obj: obj,
    });
  } else {
    const cached = gc.find((v) => v.key === key);
    if (cached !== undefined) {
      cached.obj = obj;
    }
  }
}

function openCache(): Array<CacheEntity> {
  if ((window as IgnoreAny).GlobalCache === undefined) {
    (window as IgnoreAny).GlobalCache = [];
  }
  return (window as IgnoreAny).GlobalCache as Array<CacheEntity>;
}
