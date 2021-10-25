import _ from 'lodash';
import React from 'react';
import {
    TextInput as NativeTextInput,
    Platform,
    TextInputProps,
    ViewStyle,
} from 'react-native';

import { FormStyle } from '../models/FormStyle';
import ControlField, {
    ControlFieldProps,
    ControlFieldState,
} from './ControlField';

const isWeb = Platform.OS === 'web';

type OmittedTextInputProps =
    | 'value'
    | 'parse'
    | 'validate'
    | 'format'
    | 'onChangeText'
    | 'onSubmitEditing'
    | 'onEndEditing'
    | 'onBlur'
    | 'onFocus'
    | 'onValueChange'
    | 'onValidation';

const kOmitTextInputProps: OmittedTextInputProps[] = [
    'value',
    'parse',
    'validate',
    'format',
    'onChangeText',
    'onSubmitEditing',
    'onEndEditing',
    'onBlur',
    'onFocus',
    'onValueChange',
    'onValidation',
];

type TextInputForwardProps = Omit<TextInputProps, OmittedTextInputProps>;

export interface TextInputFieldProps<T>
    extends ControlFieldProps<T, string>,
        TextInputForwardProps {
    secure?: boolean;
    mode?: 'plain' | 'contained';
}
export interface TextInputFieldState<T> extends ControlFieldState<T, string> {}

/** @deprecated */
export default class TextInputField<T = string> extends ControlField<
    T,
    string,
    TextInputFieldProps<T>,
    TextInputFieldState<T>
> {
    textInputRef = React.createRef<NativeTextInput>();

    get isCustom() {
        return true;
    }

    focus() {
        this.textInputRef.current?.focus();
    }

    blur() {
        this.textInputRef.current?.blur();
    }

    renderCustom() {
        const {
            theme,
            secure = false,
            clearTextOnFocus = false,
            style = {},
            textStyle = {},
            formStyle,
            multiline = false,
            mode = 'plain',
        } = this.props;
        const { userInput = '' } = this.state;

        const { textAlignVertical = multiline ? 'top' : 'auto' } = this.props;

        let modeStyle: ViewStyle = {};
        switch (mode) {
            case 'plain':
                break;
            case 'contained':
                modeStyle = getContainedTextFieldStyle(formStyle);
                break;
            default:
                console.warn('Unrecognized TextInputField mode:', mode);
        }

        const forwardProps = _.omit(this.props, kOmitTextInputProps);

        const commonProps: TextInputProps = {
            onChangeText: userInput => this.handleUserInput({ userInput }),
            onSubmitEditing: event => {
                this.handleBlur(event);
                this.handleSubmit(event);
            },
            onEndEditing: event => this.handleBlur(event),
            onBlur: event => this.handleBlur(event),
            onFocus: event => {
                if (clearTextOnFocus) {
                    // TODO: Clear text manually. See [task](https://trello.com/c/2DGxwivo)
                }
                return this.handleFocus(event);
            },
            clearTextOnFocus,
            secureTextEntry: secure,
            style: [
                isWeb ? kTextFieldWebStyle : undefined,
                modeStyle,
                style,
                textStyle,
            ],
            selectionColor: theme.colors.primary,
            textAlignVertical,
        };

        const combinedProps = { ...forwardProps, ...commonProps };
        if (combinedProps.disabled) {
            combinedProps.editable = false;
        }

        return (
            <NativeTextInput
                ref={this.textInputRef}
                {...combinedProps}
                value={userInput}
            />
        );
    }
}

const getContainedTextFieldStyle = (style?: FormStyle) => {
    return {
        backgroundColor: style?.colors.containedTextBackground,
        borderWidth: style?.containedTextBorderWidth,
        borderColor: style?.colors.containedTextBorder,
    };
};

const kTextFieldWebStyle: any = {
    /** Remove browser specific styling. */
    appearance: 'none',
    borderRadius: 0,
};
