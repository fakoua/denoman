import { assertEquals } from "@std/assert";
import { getWmiValue } from "../src/wmiutils.ts";

// Test case 1: Testing with a single match
Deno.test("getWmiValue should return the correct value when there is a single match", () => {
  const wmi = `class PSCustomObject
  {
    AcceptPause = True
    Caption = test
    AcceptStop = True
  }`;
  const result = getWmiValue<boolean>("AcceptPause", "Caption", wmi);
  const expected = true;
  assertEquals(result, expected);
});

Deno.test("getWmiValue should return string", () => {
  const wmi = `class PSCustomObject
  {
    AcceptPause = True
    Caption = test
    AcceptStop = True
  }`;
  const result = getWmiValue<string>("Caption", "AcceptStop", wmi);
  const expected = "test";
  assertEquals(result, expected);
});

// Test case 3: Testing with boolean values
Deno.test("getWmiValue should return boolean false correctly", () => {
  const wmi = `class PSCustomObject
  {
    AcceptPause = True
    Caption = test
    AcceptStop = False
    Foo = Bar
  }`;
  const result1 = getWmiValue<boolean>("AcceptStop", "Foo", wmi);
  const expected1 = false;
  assertEquals(result1, expected1);
});
