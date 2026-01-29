import Ajv from "ajv";

/**
 * AJV instance is created once and reused across tests.
 * - allErrors: collect *all* schema violations (not just the first one)
 * - strict: false to avoid noisy strict-mode warnings for this take-home case
 *
 * Why reuse a single instance?
 * - Faster than creating a new Ajv instance per validation call
 * - Keeps schema validation behavior consistent across the suite
 */
const ajv = new Ajv({ allErrors: true, strict: false });

type SchemaValidationResult = {
  ok: boolean;
  errors: ReturnType<typeof ajv.compile>["errors"] extends null | undefined ? never : ReturnType<typeof ajv.compile>["errors"];
};

/**
 * Validates `data` against a JSON schema.
 *
 * Design goals:
 * - Small, predictable API for tests (returns ok + errors)
 * - No throwing: tests decide how to assert and what message to show
 *
 * Note:
 * - `ajv.compile` caches compiled schemas internally (per Ajv instance),
 *   so calling this multiple times is fine for a small suite.
 */
export function validateSchema(schema: object, data: unknown): SchemaValidationResult {
  const validate = ajv.compile(schema);
  const ok = validate(data);

  return {
    ok: Boolean(ok),
    errors: (validate.errors ?? []) as SchemaValidationResult["errors"],
  };
}