import React, { Component } from 'react';
import TextInputField, { TextInputFieldProps } from './TextInputField';
import _ from 'lodash';
import { withTheme } from 'react-native-paper';
import { lz } from '../util/locale';

type NumberType = number | undefined;

type ForwardProps = Omit<
    TextInputFieldProps<NumberType>,
    'format' | 'validate' | 'parse'
>;

interface FloatInputFieldProps extends ForwardProps {
    gt?: number;
    gte?: number;
    lt?: number;
    lte?: number;
}

interface FloatInputFieldState {}

class FloatInputField extends Component<
    FloatInputFieldProps,
    FloatInputFieldState
> {
    private static INPUT_REGEX = /[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)/;

    parse(userInput: string): { value: NumberType; error?: Error } {
        if (!FloatInputField.INPUT_REGEX.test(userInput)) {
            return {
                value: undefined,
                error: new Error(),
            };
        }
        let value = Number.parseFloat(userInput);
        return {
            value,
            error:
                typeof value !== 'number' || Number.isNaN(value)
                    ? new Error(lz('invalidValue'))
                    : undefined,
        };
    }

    validate(value: NumberType): { valid: boolean; error?: Error } {
        if (!_.isNumber(value) || !Number.isFinite(value)) {
            return {
                valid: false,
                error: new Error(lz('invalidValue')),
            };
        }
        if (typeof this.props.gte === 'number' && value < this.props.gte) {
            return {
                valid: false,
                error: new Error(
                    lz('valueMustBeGTE', {
                        value: this.props.gte,
                    })
                ),
            };
        }
        if (typeof this.props.gt === 'number' && value <= this.props.gt) {
            return {
                valid: false,
                error: new Error(
                    lz('valueMustBeGT', {
                        value: this.props.gt,
                    })
                ),
            };
        }
        if (typeof this.props.lte === 'number' && value > this.props.lte) {
            return {
                valid: false,
                error: new Error(
                    lz('valueMustBeLTE', {
                        value: this.props.lte,
                    })
                ),
            };
        }
        if (typeof this.props.lt === 'number' && value >= this.props.lt) {
            return {
                valid: false,
                error: new Error(
                    lz('valueMustBeLT', {
                        value: this.props.lt,
                    })
                ),
            };
        }
        return { valid: true };
    }

    format(value: NumberType): string {
        if (typeof value !== 'number') return '';
        if (Number.isNaN(value)) return '';
        return value.toString();
    }

    render() {
        return (
            <TextInputField<NumberType>
                {...this.props}
                parse={args => this.parse(args)}
                validate={args => this.validate(args)}
                format={args => this.format(args)}
                keyboardType='numeric'
            />
        );
    }
}

export default withTheme(FloatInputField);
