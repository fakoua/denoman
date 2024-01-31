export type CacheEntity = {
  key: string;
  obj: any;
};
export function has(key: string): boolean {
  const gc = openCache();
  return gc.find((v) => v.key === key) !== undefined;
}

export function get<T>(key: string): T | undefined {
  const gc = openCache();
  if (!has(key)) {
    return undefined;
  }
  const cached = gc.find((v) => v.key === key);
  return cached?.obj as T;
}

export function put(key: string, obj: any) {
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
  if ((window as any).GlobalCache === undefined) {
    (window as any).GlobalCache = [];
  }
  return (window as any).GlobalCache as Array<CacheEntity>;
}
