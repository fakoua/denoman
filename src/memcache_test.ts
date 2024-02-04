import { assertEquals } from "https://deno.land/std@0.214.0/assert/assert_equals.ts";
import { get, has, put } from "./memcache.ts";

// Mock window object
// deno-lint-ignore no-explicit-any
(window as any).GlobalCache = ["test", "test"];

Deno.test("has should return false when the key does not exist", () => {
  assertEquals(has("nonexistent"), false);
});

Deno.test("has should return true when the key exists", () => {
  put("test", { key: "test", obj: "test" });
  assertEquals(has("test"), true);
});

Deno.test("get should return undefined when the key does not exist", () => {
  assertEquals(get("nonexistent"), undefined);
});

Deno.test("get should return the object when the key exists", () => {
  const obj = "test";
  put("test", obj);
  assertEquals(get("test"), obj);
});

Deno.test("put should add a new object to the cache", () => {
  const obj = "new";
  put("new", obj);
  assertEquals(get("new"), obj);
});

Deno.test("put should update an existing object in the cache", () => {
  const obj = "updated";
  put("test", obj);
  assertEquals(get("test"), obj);
});
