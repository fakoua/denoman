/**
 * Retrieves the value from a WMI query result based on the specified property names.
 *
 * @template T - The type of the value to be returned.
 * @param propName - The name of the property to match.
 * @param nexPropName - The name of the next property to match.
 * @param wmi - The WMI query result string.
 * @returns The value extracted from the WMI query result.
 */
export function getWmiValue<T>(
  propName: string,
  nexPropName: string,
  wmi: string,
): T {
  let rtnVal = "";
  const regexStr = `\\s\\s${propName}\\s\\=\\s(.*)\\s\\s${nexPropName}\\s\\=`;
  const regex = new RegExp(regexStr, "igms");
  const matches = wmi.matchAll(regex);
  for (const match of matches) {
    rtnVal = `${rtnVal}${match[1]}`;
  }
  rtnVal = rtnVal.trim();
  rtnVal = rtnVal.replaceAll("\r\n", " ");
  rtnVal = rtnVal.replaceAll("  ", " ");
  rtnVal = rtnVal.replaceAll("  ", " ");

  if (rtnVal === "True" || rtnVal === "False") {
    return (rtnVal === "True") as T;
  }
  return rtnVal as T;
}
