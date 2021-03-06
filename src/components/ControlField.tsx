import _ from 'lodash';
import React from 'react';
import { View } from 'react-native';

import LabelField, { LabelFieldProps, LabelFieldState } from './LabelField';

export interface ControlFieldProps<OutputType, InputType>
    extends LabelFieldProps<OutputType> {
    /** How to parse input value into output value. */
    parse?: (userInput: InputType) => Partial<ParseResult<OutputType>>;
    /** How to clean user input for display. Defaults to using format(). */
    encode?: (value: OutputType) => InputType;
    validate?: (value: OutputType) => { valid: boolean; error?: any };
    onValueChange?: (x: { value: OutputType; error?: any }) => void;
    onValidation?: (x: { valid: boolean; error?: any }) => void;
    onFocus?: (event: any) => void;
    onBlur?: (event: any) => void;
    onSubmit?: (event: any) => void;
}

export interface ParseResult<OutputType> {
    /** The final value. */
    value?: OutputType;
    /** User input error. */
    error?: any;
    /** Is user input prasable. */
    parsable: boolean;
}

export interface ControlFieldState<OutputType, InputType>
    extends LabelFieldState<OutputType>,
        Omit<ParseResult<OutputType>, 'value'> {
    /** User input value. */
    userInput: InputType;
    /** Did current value pass validation. */
    valid: boolean;
}

export interface ControlFieldBlurInfo {
    didSubmit?: boolean;
}

/** @deprecated */
export default class ControlField<
    O = any,
    I = any,
    P extends ControlFieldProps<O, I> = ControlFieldProps<O, I>,
    S extends ControlFieldState<O, I> = ControlFieldState<O, I>
> extends LabelField<O, P, S> {
    editing = false;
    didChangeValue = false;

    constructor(props: P) {
        super(props);
        const state = { value: props.value };
        this.state = {
            ...this.setValueMutation(state),
            ...this.encodeMutation(state),
        } as S;
    }

    componentDidMount() {
        this.validate();
    }

    getSnapshotBeforeUpdate(prevProps: P, prevState: S) {
        if (
            !this.editing &&
            !_.isEqual(this.props.value, prevProps.value) &&
            !_.isEqual(this.props.value, this.state.value)
        ) {
            return { value: this.props.value };
        }
        return null;
    }

    componentDidUpdate(prevProps: P, prevState: S, snapshot: any) {
        if (snapshot) {
            this.setValue(snapshot.value);
        }
    }

    setValue(value: O) {
        let state = { value, parsable: true };
        state = {
            ...this.setValueMutation(state),
            ...this.encodeMutation(state),
        } as S;
        this.setState(state);
    }

    submit() {
        if (this.state.parsable) {
            this.setState(this.encodeMutation(this.state) as S);
        }
    }

    reset() {
        this.setValue(this.props.value);
    }

    validate() {
        const v = this.validation(this.state.value);
        this.props.onValidation?.(v);
        return v;
    }

    parse(userInput: I): ParseResult<O> {
        const { parse } = this.props;
        if (!parse) {
            return { value: userInput as any, parsable: true };
        }
        let data: Partial<ParseResult<O>> = {};
        try {
            data = parse(userInput);
        } catch (err) {
            data = { value: undefined, error: err, parsable: false };
        }
        if (!('value' in data)) {
            throw new Error(
                'Expected an object with the value, instead got: ' + data
            );
        }
        return { ...data, parsable: !data.error };
    }

    validation(value: O): { valid: boolean; error?: any } {
        return this.props.validate?.(value) || { valid: true };
    }

    onValueChange = ({ value, error = '' }: { value: O; error?: string }) => {
        const v = this.validation(value);
        this.props.onValueChange?.({
            value: v.valid ? value : this.state.value,
            error,
        });
        this.props.onValidation?.(v);
    };

    handleFocus(event: any) {
        if (this.editing) {
            return;
        }
        this.editing = true;
        this.didChangeValue = false;
        this.props.onFocus?.(event);
    }

    handleBlur(event: any) {
        if (!this.editing) {
            return;
        }
        this.editing = false;
        if (this.didChangeValue) {
            this.didChangeValue = false;
            this.handleUserInput(this.state);
        }
        this.submit();
        this.props.onBlur?.(event);
    }

    handleSubmit(event: any) {
        this.props.onSubmit?.(event);
    }

    handleUserInput({ userInput }: { userInput: I }): any {
        const data = this.parse(userInput);
        const newState = {
            ...this.setValueMutation(data),
            userInput,
        } as S;
        this.setState(newState);
        this.onValueChange(newState);
        return newState;
    }

    renderContent() {
        return [this.renderTitleAndValue(), this.renderControl()];
    }

    renderControl(): JSX.Element {
        return <View key='control' />;
    }

    private setValueMutation(
        newState: Partial<ControlFieldState<O, I>>
    ): Partial<ControlFieldState<O, I>> & {
        valid: boolean;
        error: any;
        parsable: boolean;
    } {
        const { parsable = !newState.error } = newState;
        const validation = this.validationMutation(newState);
        const mutation = {
            ...newState,
            valid: !newState.error && validation.valid,
            error: newState.error || validation.error,
            parsable,
        };
        return mutation;
    }

    private validationMutation(
        newState: Partial<ControlFieldState<O, I>>
    ): Partial<ControlFieldState<O, I>> & {
        valid: boolean;
        error: any;
    } {
        if (newState.error) {
            return {
                error: newState.error,
                valid: false,
            };
        }
        const v = this.validation(
            'value' in newState ? newState.value! : this.state!.value
        );
        return {
            error: v.error,
            valid: v.valid,
        };
    }

    private encodeMutation({ value }: { value: O }) {
        const { encode = (value: O) => this.format(value) as any } = this.props;
        return {
            userInput: encode(value),
        } as Partial<S>;
    }
}
