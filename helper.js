function validateDefined(response, label, value) {
  if (typeof value === "undefined") {
    response.status(400);
    response.send(`Property '${label}' is missing.`);

    return false;
  }

  return true;
}

function validateType(response, label, value, type) {
  if (typeof value !== type) {
    response.status(400);
    response.send(`Property '${label}' should be a string.`);

    return false;
  }

  return true;
}

module.exports = { validateDefined, validateType };