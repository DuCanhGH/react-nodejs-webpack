// @ts-check
/**
 * Safely converts anything to boolean
 *
 * @example
 *   // returns false
 *   convertBoolean("false");
 *   convertBoolean("hehe", true);
 *   convertBoolean("0");
 *   convertBoolean(0);
 *   // returns true
 *   convertBoolean("true");
 *   convertBoolean("hehe", false);
 *   convertBoolean("1");
 *   convertBoolean(1);
 *
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
