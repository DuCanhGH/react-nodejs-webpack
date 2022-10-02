// @ts-check
/**
 * @param {unknown} value
 * @param {boolean} [strict=true] Default is `true`
 * @returns {boolean}
 */
const convertBoolean = (value, strict = true) => {
  switch (typeof value) {
    case "boolean":
      return value;
    case "number":
      return value > 0;
    case "object":
      return !(value === null);
    case "string":
      if (!strict) {
        if (value === "false" || value === "0") return false;
        return true;
      }
      return value === "true" || value === "1";
    case "undefined":
    default:
      return false;
  }
};

export default convertBoolean;
