import React, { Component } from 'react';
import TextInputField, { TextInputFieldProps } from './TextInputField';
import { parseTimeOfDay } from '@diatche/parse-time';
import moment, { Duration } from 'moment';
import { FormValidationError } from '../models/FormError';
import { lz } from '../util/locale';

type ForwardProps = Omit<
    TextInputFieldProps<Duration | undefined>,
    'format' | 'parse'
> &
    Partial<
        Pick<TextInputFieldProps<Duration | undefined>, 'format' | 'autoFocus'>
    >;

interface TimeInputFieldProps extends ForwardProps {}

interface TimeInputFieldState {}

export default class TimeInputField extends Component<
    TimeInputFieldProps,
    TimeInputFieldState
> {
    textInputRef = React.createRef<TextInputField<Duration | undefined>>();

    parse(userInput: string): { value: Duration | undefined; error: any } {
        let value = parseTimeOfDay(userInput);
        if (value) {
            return { value: moment.duration(value.totalMs), error: null };
        } else {
            return {
                value: undefined,
                error: new FormValidationError(lz('invalidTime')),
            };
        }
    }

    focus() {
        this.textInputRef?.current?.focus();
    }

    blur() {
        this.textInputRef?.current?.blur();
    }

    format(value: Duration | undefined): string {
        if (this.props.format) {
            return this.props.format(value);
        }
        if (!moment.isDuration(value)) return '';
        return moment().startOf('day').add(value).format('LT');
    }

    render() {
        return (
            <TextInputField<Duration | undefined>
                {...this.props}
                ref={this.textInputRef}
                parse={args => this.parse(args)}
                format={args => this.format(args)}
                keyboardType='numbers-and-punctuation'
                autoCorrect={false}
                autoCompleteType='off'
            />
        );
    }
}
