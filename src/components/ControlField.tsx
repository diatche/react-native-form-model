import React from 'react';
import { View } from 'react-native';
import _ from 'lodash';
import LabelField, { LabelFieldProps, LabelFieldState } from './LabelField';

export interface ControlFieldProps<OutputType, InputType>
    extends LabelFieldProps<OutputType> {
    /** How to parse input value into output value. */
    parse?: (userInput: InputType) => { value?: OutputType; error?: any };
    /** How to clean user input for display. Defaults to using format(). */
    encode?: (value: OutputType) => InputType;
    validate?: (value: OutputType) => { valid: boolean; error?: any };
    onValueChange?: (x: { value: OutputType; error?: any }) => void;
    onValidation?: (x: { valid: boolean; error?: any }) => void;
    onFocus?: (event: any) => void;
    onBlur?: (event: any) => void;
}

export interface ControlFieldState<OutputType, InputType>
    extends LabelFieldState<OutputType> {
    /** User input value. */
    userInput: InputType;
    /** Is user input prasable. */
    parsable: boolean;
    /** Did current value pass validation. */
    valid: boolean;
}

/** @deprecated */
export default class ControlField<
    O = any,
    I = any,
    P extends ControlFieldProps<O, I> = ControlFieldProps<O, I>,
    S extends ControlFieldState<O, I> = ControlFieldState<O, I>
> extends LabelField<O, P, S> {
    editing = false;

    constructor(props: P) {
        super(props);
        let state = { value: props.value };
        this.state = {
            ...this.setValueMutation(state),
            ...this.encodeMutation(state),
        } as S;
    }

    componentDidMount() {
        this.validate();
    }

    componentDidUpdate(prevProps: P) {
        if (
            !this.editing &&
            this.props.value !== prevProps.value &&
            this.props.value !== this.state.value
        ) {
            this.setValue(this.props.value);
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
        let v = this.validation(this.state.value);
        this.props.onValidation?.(v);
        return v;
    }

    parse(userInput: I): { value?: O; error?: any; parsable: boolean } {
        let { parse } = this.props;
        if (!parse) {
            return { value: userInput as any, parsable: true };
        }
        let data = parse(userInput);
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
        let v = this.validation(value);
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
        this.props.onFocus?.(event);
    }

    handleBlur(event: any) {
        if (!this.editing) {
            return;
        }
        this.editing = false;
        this.handleUserInput(this.state);
        this.submit();
        this.props.onBlur?.(event);
    }

    handleUserInput({ userInput }: { userInput: I }): any {
        let data = this.parse(userInput);
        let newState = {
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
        let mutation = {
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
        let v = this.validation(
            'value' in newState ? newState.value! : this.state!.value
        );
        return {
            error: v.error,
            valid: v.valid,
        };
    }

    private encodeMutation({ value }: { value: O }) {
        let { encode = (value: O) => this.format(value) as any } = this.props;
        return {
            userInput: encode(value),
        } as Partial<S>;
    }
}
