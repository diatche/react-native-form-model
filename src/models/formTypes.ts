import { BehaviorSubject } from 'rxjs';

import { FormValidationError } from './FormError';

export type InputFieldValidationValue =
    | InputFieldValidationResult
    | Error
    | string
    | boolean;

export interface InputFieldValidationResult {
    valid: boolean;
    error?: FormValidationError;
}

export interface FieldModelLike {
    errors: BehaviorSubject<Error[]>;
}

export interface InputFieldModelLike<T> extends FieldModelLike {
    value: BehaviorSubject<T>;
    validate: () => InputFieldValidationResult;
    viewRef?: InputFieldViewRef;
}

export interface InputFieldViewLike {
    focus: () => void;
    blur: () => void;
}

export interface InputFieldViewRef {
    current?: InputFieldViewLike | null;
}

export function isFieldModelLike(value: any): value is FieldModelLike {
    return value && typeof value === 'object' && 'errors' in value;
}

export function isInputFieldModelLike(
    value: any
): value is InputFieldModelLike<any> {
    return isFieldModelLike(value) && 'value' in value && 'validate' in value;
}
