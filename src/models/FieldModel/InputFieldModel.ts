import _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { lz } from '../../util/locale';
import { EditableFieldModel } from '../FormElement';
import FormError, { FormParseError, FormValidationError } from '../FormError';
import {
    InputFieldModelLike,
    InputFieldValidationResult,
    InputFieldValidationValue,
    InputFieldViewRef,
} from '../formTypes';
import FieldModel, { FieldModelOptions } from './FieldModel';

export interface InputFieldState<T> {
    value?: T;
    error?: FormError;
}

export interface InputFieldValueInfo<T, I = string> extends InputFieldState<T> {
    field: InputFieldModel<T, I>;
}

export interface InputFieldModelOptions<T, I = string>
    extends FieldModelOptions {
    value: BehaviorSubject<T>;
    onValueChange?: (info: InputFieldValueInfo<T, I>) => void;
    defaultValue?: T;
    placeholder?: string;
    disabled?: boolean;
    /**
     * If true, this field will be skipped, when the previous
     * submitted field is searching for the next field to focus.
     */
    skipNextFocus?: boolean;
    /** Parse an input value or throw an error. */
    parseInput: (input: I) => T;
    formatValue?: (value: T | undefined) => string;
    validation?: (value?: T) => InputFieldValidationValue;
}

export interface InputFieldModelDelegate<T, I> {
    willValidate: (field: InputFieldModel<T, I>) => void;
}

export type ParsedInputFieldModelOptions<T, I> = Omit<
    InputFieldModelOptions<T, I>,
    'parseInput'
> &
    Partial<Pick<InputFieldModelOptions<T, I>, 'parseInput'>>;

export default class InputFieldModel<T, I = string>
    extends FieldModel
    implements EditableFieldModel, InputFieldModelLike<T>
{
    readonly value: BehaviorSubject<T>;
    readonly edited: BehaviorSubject<boolean>;
    defaultValue: T;
    placeholder: string;
    disabled: boolean;
    skipNextFocus: boolean;
    /** Parse an input value or throw an error. */
    parseInput: (input: I) => T;
    formatValue: (value: T | undefined) => string;
    validation?: (value?: T) => InputFieldValidationValue;
    viewRef?: InputFieldViewRef;
    delegate?: InputFieldModelDelegate<T, I>;

    private _onValueChangeCb?: InputFieldModelOptions<T, I>['onValueChange'];

    constructor(options: InputFieldModelOptions<T, I>) {
        super(options);
        const {
            defaultValue = options.value.value,
            placeholder = '',
            disabled = false,
            skipNextFocus = false,
            formatValue = x =>
                x === null || typeof x === 'undefined' ? '' : String(x),
            parseInput,
        } = options;
        this.value = options.value;
        this.defaultValue = defaultValue;
        this.edited = new BehaviorSubject<boolean>(false);
        this.placeholder = placeholder;
        this.disabled = disabled;
        this.skipNextFocus = skipNextFocus;
        this.parseInput = parseInput;
        this.formatValue = formatValue;
        this.validation = options.validation;

        this._onValueChangeCb = options.onValueChange;
    }

    getState(): InputFieldState<T> {
        const value = this.value.value;
        const { error } = this.normalizedValidationResult(value);
        return error ? { error } : { value };
    }

    parseState(input: I): InputFieldState<T> {
        let value: T | undefined;
        let error: Error | undefined;
        try {
            // TODO: Debounce input parsing. See [task](https://trello.com/c/CP9flI1D)
            value = this.parseInput(input);
        } catch (err: any) {
            let parsedError: FormParseError = err;
            if (!(err instanceof FormParseError)) {
                parsedError = new FormParseError(err?.message || String(err));
            }
            error = parsedError;
        }

        if (!error) {
            const { valid = true, error: validationError } =
                this.normalizedValidationResult(value);
            if (!valid) {
                error =
                    validationError ||
                    new FormValidationError(lz('invalidValue'));
            }
        }
        return { value, error };
    }

    setInput(input: I): InputFieldState<T> {
        const state = this.parseState(input);
        this.setState(state);
        return state;
    }

    resetInput(): InputFieldState<T> {
        const value = this.defaultValue;
        const { error } = this.normalizedValidationResult(value);
        const state = error ? { error } : { value };
        this.setState(state);
        this.edited.next(false);
        return state;
    }

    isEditable(): this is EditableFieldModel {
        return true;
    }

    isValueValid(value: T | undefined): value is T {
        return this.normalizedValidationResult(value).valid;
    }

    normalizedValidationResult(
        value: T | undefined
    ): InputFieldValidationResult {
        let validation: InputFieldValidationValue | undefined;
        let valid = true;
        let error: Error | undefined;
        try {
            validation = this.validation?.(value);
        } catch (err: any) {
            let parsedError: Error = err;
            if (!(err instanceof Error)) {
                parsedError = new Error(
                    String(err?.message || err || 'Unknown validation error')
                );
            }
            error = parsedError;
        }
        if (error) {
            valid = false;
        } else if (typeof validation === 'undefined') {
            // Assume valid
        } else if (typeof validation === 'boolean') {
            valid = validation;
        } else if (typeof validation === 'string') {
            // Assume error description
            valid = false;
            error = new FormValidationError(validation);
        } else if (typeof validation === 'object') {
            if (validation instanceof Error) {
                valid = false;
                error = validation;
            } else {
                if (typeof validation.valid === 'undefined') {
                    valid = !validation.error;
                } else {
                    valid = !!validation.valid;
                }
                error = validation.error || undefined;
                if (error && !(error instanceof Error)) {
                    error = new FormValidationError(String(error || ''));
                }
            }
        } else {
            console.error(
                'Unexpected form validation result. Assuming invalid.'
            );
            valid = false;
            error = new Error('Unexpected validation result');
        }
        if (!valid && !error) {
            error = new FormValidationError(lz('invalidValue'));
        }
        return { valid, error };
    }

    validate(): InputFieldValidationResult {
        this.delegate?.willValidate(this);
        const { valid = true, error } = this.normalizedValidationResult(
            this.value.value
        );
        this.setState({
            value: this.value.value,
            error: valid ? undefined : error,
        });
        return { valid, error };
    }

    formattedValue(): Observable<string> {
        return this.value.pipe(map(v => this.formatValue(v)));
    }

    setState({ value, error }: InputFieldState<T>) {
        if (error) {
            // if (!(error instanceof FormValidationError)) {
            //     value = this.defaultValue;
            // }
            if (
                this.errors.value.length !== 1 ||
                error !== this.errors.value[0]
            ) {
                this.errors.next([error]);
            }
        } else if (this.errors.value.length !== 0) {
            this.errors.next([]);
        }

        const didChangeValue = !_.isEqual(value, this.value.value);
        if (didChangeValue) {
            this.value.next(value!);
        }

        if (this.isMounted && !this.edited.value) {
            this.edited.next(true);
        }

        if (didChangeValue) {
            this._onValueChangeCb?.({
                value: value!,
                error,
                field: this,
            });
        }
    }

    onUnmount() {
        super.onUnmount();
        this.edited.next(false);
    }
}
