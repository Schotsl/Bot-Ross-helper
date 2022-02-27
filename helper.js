export function validateDefined(response, label, value) {
  if (typeof value === "undefined") {
    response.body = `Property '${label}' is missing.`
    response.status = 400;
  }
}

export function validateType(response, label, value, type) {
  if (typeof value !== type) {
    response.body = `Property '${label}' should be a string.`;
    response.status = 400;
  }
}