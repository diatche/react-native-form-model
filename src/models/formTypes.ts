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

export interface FieldModelLike<View extends FieldViewLike = any> {
    errors: BehaviorSubject<Error[]>;
    viewRef?: ViewRef<View>;
}

export interface InputFieldModelLike<T> extends FieldModelLike {
    value: BehaviorSubject<T>;
    validate: () => InputFieldValidationResult;
    skipNextFocus: boolean;
}

export interface FieldViewLike {}

export interface InputFieldViewLike {
    focus: () => void;
    blur: () => void;
}

export interface ViewRef<T extends FieldViewLike = any> {
    current?: T | null;
}

export function isFieldModelLike(value: any): value is FieldModelLike {
    return value && typeof value === 'object' && 'errors' in value;
}

export function isInputFieldModelLike(
    value: any
): value is InputFieldModelLike<any> {
    return isFieldModelLike(value) && 'value' in value && 'validate' in value;
}
