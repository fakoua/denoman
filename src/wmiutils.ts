export function getWmiValue<T>(propName: string, nexPropName: string, wmi: string): T {
    let rtnVal = "";
    const regexStr = `\\s\\s${propName}\\s\\=\\s(.*)\\s\\s${nexPropName}\\s\\=`;
    const regex = new RegExp(regexStr, "igms");
    const matches = wmi.matchAll(regex);
    for(const match of matches) {
        rtnVal = `${rtnVal}${match[1]}`;
    }
    rtnVal = rtnVal.trim();
    rtnVal = rtnVal.replaceAll("\r\n", " ")
    rtnVal = rtnVal.replaceAll("  ", " ")
    rtnVal = rtnVal.replaceAll("  ", " ")

    if (rtnVal === "True" || rtnVal === "False")
    {
        return (rtnVal === "True") as T
    }
    return rtnVal as T;
}