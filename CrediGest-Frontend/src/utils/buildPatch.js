export function buildPatch(original, updated, map) {
  const payload = {};

  Object.entries(map).forEach(([frontKey, backKey]) => {
    let originalValue = original[frontKey];
    let updatedValue = updated[frontKey];

    if (typeof updatedValue === "string") {
      updatedValue = updatedValue.trim();
    }

    if (typeof originalValue === "string") {
      originalValue = originalValue.trim();
    }

    if (String(updatedValue) !== String(originalValue)) {
      payload[backKey] = updatedValue;
    }
  });

  return payload;
}
