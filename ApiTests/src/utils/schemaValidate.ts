import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true, strict: false });

export function validateSchema(schema: object, data: unknown) {
  const validate = ajv.compile(schema);
  const ok = validate(data);
  return { ok: !!ok, errors: validate.errors ?? [] };
}