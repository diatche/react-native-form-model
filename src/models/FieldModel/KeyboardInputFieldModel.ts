import { isNaN } from 'lodash';
import { KeyboardTypeOptions, TextInputProps } from 'react-native';

import { FieldModelOptions } from './FieldModel';
import InputFieldModel, {
    InputFieldModelOptions,
    ParsedInputFieldModelOptions,
} from './InputFieldModel';

export interface KeyboardInputFieldModelBaseOptions
    extends Pick<
        TextInputProps,
        'clearTextOnFocus' | 'selectTextOnFocus' | 'clearButtonMode'
    > {
    optional?: boolean;
    autoFocus?: boolean;
    mode?: 'plain' | 'contained';
}

export interface KeyboardInputFieldModelOwnOptions
    extends KeyboardInputFieldModelBaseOptions,
        Pick<
            TextInputProps,
            'textContentType' | 'autoCapitalize' | 'multiline' | 'returnKeyType'
        > {
    type: KeyboardInputFieldType;
    keyboardType: KeyboardTypeOptions;

    /**
     * If true, then the value will be updated as the user types.
     * If false (the default), the value will only update when
     * the user finishes typing.
     *
     * The latter is recommeded when a validator is used.
     */
    submitOnChangeValue?: boolean;
}

export interface KeyboardInputFieldModelOptions<T>
    extends Partial<KeyboardInputFieldModelOwnOptions>,
        ParsedInputFieldModelOptions<T, string> {}

export type KeyboardInputFieldType =
    | 'text'
    | 'secure'
    | 'email'
    | 'integer'
    | 'float'
    | 'unsignedInteger'
    | 'unsignedFloat';

export default class KeyboardInputFieldModel<T>
    extends InputFieldModel<T>
    implements KeyboardInputFieldModelOwnOptions
{
    type: KeyboardInputFieldType;
    mode: KeyboardInputFieldModelOwnOptions['mode'] | undefined;
    keyboardType: KeyboardTypeOptions;
    returnKeyType: TextInputProps['returnKeyType'];
    textContentType: TextInputProps['textContentType'] | undefined;
    optional: boolean;
    multiline: boolean;
    autoFocus: boolean;
    clearTextOnFocus: TextInputProps['clearTextOnFocus'];
    selectTextOnFocus: TextInputProps['selectTextOnFocus'];
    clearButtonMode: TextInputProps['clearButtonMode'];
    autoCapitalize: TextInputProps['autoCapitalize'] | undefined;
    submitOnChangeValue: boolean;

    constructor(options: KeyboardInputFieldModelOptions<T>) {
        const optionsWithDefaults = {
            ...KeyboardInputFieldModel.defaults<T>(options),
            ...options,
        };
        super(optionsWithDefaults);
        this.type = optionsWithDefaults.type;
        this.mode = optionsWithDefaults.mode;
        this.validation = optionsWithDefaults.validation;
        this.keyboardType = optionsWithDefaults.keyboardType;
        this.returnKeyType = optionsWithDefaults.returnKeyType;
        this.textContentType = optionsWithDefaults.textContentType;
        this.optional = optionsWithDefaults.optional;
        this.autoCapitalize = optionsWithDefaults.autoCapitalize;

        const {
            multiline = false,
            autoFocus = false,
            clearTextOnFocus = false,
            selectTextOnFocus = false,
            clearButtonMode = 'never',
            submitOnChangeValue = false,
        } = optionsWithDefaults;

        this.multiline = multiline;
        this.autoFocus = autoFocus;
        this.clearTextOnFocus = clearTextOnFocus;
        this.selectTextOnFocus = selectTextOnFocus;
        this.clearButtonMode = clearButtonMode;
        this.submitOnChangeValue = submitOnChangeValue;
    }

    static defaults<T>(
        options: KeyboardInputFieldModelOptions<T>
    ): KeyboardInputFieldModelDefaults<T> {
        return _defaults(options);
    }
}

export type KeyboardInputFieldModelDefaults<T> = Omit<
    KeyboardInputFieldModelOwnOptions & InputFieldModelOptions<T, string>,
    keyof FieldModelOptions | 'value' | 'defaultValue'
> &
    Required<Pick<KeyboardInputFieldModelOwnOptions, 'optional'>>;

let _defaults = (
    options: KeyboardInputFieldModelOptions<any>
): KeyboardInputFieldModelDefaults<any> => {
    const { type = 'text', mode = 'plain', optional = false } = options;
    const sharedDefaults = {
        type,
        mode,
        optional,
    };
    switch (type) {
        case 'text':
            return {
                ...sharedDefaults,
                parseInput: x =>
                    x === null || typeof x === 'undefined' ? '' : String(x),
                keyboardType: 'default',
            };
        case 'secure':
            return {
                ...sharedDefaults,
                parseInput: x =>
                    x === null || typeof x === 'undefined' ? '' : String(x),
                keyboardType: 'default',
                textContentType: 'password',
            };
        case 'email':
            return {
                ...sharedDefaults,
                parseInput: x =>
                    x === null || typeof x === 'undefined' ? '' : String(x),
                keyboardType: 'email-address',
                textContentType: 'emailAddress',
                autoCapitalize: 'none',
            };
        case 'integer':
            return {
                ...sharedDefaults,
                parseInput: parseInt,
                validation: createDefaultNumberValidator({ optional }),
                keyboardType: 'numbers-and-punctuation',
            };
        case 'float':
            return {
                ...sharedDefaults,
                parseInput: optional
                    ? x => (!x ? undefined : parseFloat(x))
                    : parseFloat,
                validation: createDefaultNumberValidator({ optional }),
                keyboardType: 'numbers-and-punctuation',
            };
        case 'unsignedInteger':
            return {
                ...sharedDefaults,
                parseInput: parseInt,
                validation: createDefaultNumberValidator({
                    optional,
                    positiveOnly: true,
                }),
                keyboardType: 'number-pad',
            };
        case 'unsignedFloat':
            return {
                ...sharedDefaults,
                parseInput: optional
                    ? x => (!x ? undefined : parseFloat(x))
                    : parseFloat,
                validation: createDefaultNumberValidator({
                    optional,
                    positiveOnly: true,
                }),
                keyboardType: 'decimal-pad',
            };
    }
    throw new Error('Invalid input type: ' + type);
};

function createDefaultNumberValidator({
    optional = false,
    positiveOnly = false,
}: {
    optional?: boolean;
    positiveOnly?: boolean;
}) {
    if (optional) {
        return (x: number) => ({
            valid:
                typeof x === 'undefined' ||
                String(x) === '' ||
                x === null ||
                (typeof x === 'number' &&
                    !isNaN(x) &&
                    isFinite(x) &&
                    (!positiveOnly || x >= 0)),
        });
    } else {
        return (x: number) => ({
            valid:
                typeof x === 'number' &&
                !isNaN(x) &&
                isFinite(x) &&
                (!positiveOnly || x >= 0),
        });
    }
}
