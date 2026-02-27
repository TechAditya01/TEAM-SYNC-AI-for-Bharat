export const sanitizeKey = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[.#$\/[\]]/g, '_')
    .replace(/\s+/g, '_');
