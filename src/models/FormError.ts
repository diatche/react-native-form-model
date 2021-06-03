/** Base form error. */
export default class FormError extends Error {}

export class FormParseError extends FormError {}

export class FormValidationError extends FormError {}
