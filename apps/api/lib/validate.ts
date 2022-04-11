import Ajv, { Schema } from 'ajv';

const ajv = new Ajv();

export function validate(schema: Schema, params: any, err?: any) {
  const validator = ajv.compile(schema);
  const valid = validator(params);

  if (!valid) {
    throw err || new Error(validator.errors[0]?.message);
  }
}
