import React from 'react';
import { View, ViewStyle, StyleProp, TextStyle, FlexStyle } from 'react-native';
import { Text, Caption, TouchableRipple } from 'react-native-paper';
import _ from 'lodash';
import { PaperThemeWithForm } from '../models/FormStyle';

export type Alignment = 'left' | 'center' | 'right';

const kJustifyTextAlignMap: {
    [A in Alignment]: FlexStyle['justifyContent'];
} = {
    left: 'flex-start',
    center: 'space-between',
    right: 'flex-end',
};

export interface LabelFieldProps<T> extends Omit<ViewStyle, 'value'> {
    value: T;
    label?: string;
    placeholder?: string;
    format?: (value: T) => string;
    onPress?: (event: any) => void;
    theme: PaperThemeWithForm;
    align?: Alignment;
    style?: StyleProp<TextStyle>;
    textStyle?: StyleProp<TextStyle>;
    rippleColor?: string;
    disabled?: boolean;
    /**
     * If true, does not render label, placeholder and
     * value.
     **/
    custom?: boolean;
}

export interface LabelFieldState<T> {
    /** The final value. */
    value: T;
    /** User input error. */
    error?: any;
}

/** @deprecated */
export default class LabelField<
    T = any,
    P extends LabelFieldProps<T> = LabelFieldProps<T>,
    S extends LabelFieldState<T> = LabelFieldState<T>
> extends React.PureComponent<P, S> {
    initialValue: T;

    constructor(props: P) {
        super(props);
        this.initialValue = props.value;
        this.state = {
            value: props.value,
        } as S;
    }

    componentDidUpdate(prevProps: P, prevState: S, snapshot: any) {
        if (!_.isEqual(this.props.value, prevProps.value)) {
            this.setState({
                value: this.props.value,
            });
        }
    }

    get isCustom() {
        return !!this.props.custom;
    }

    format(value: T): string {
        if (this.props.format) {
            try {
                return this.props.format(value);
            } catch (err) {
                console.error('Error during formatting: ' + err.message);
                return '';
            }
        } else if (typeof value === 'undefined' || value === null) {
            return '';
        } else {
            return String(value);
        }
    }

    handlePress(event: any) {
        this.props.onPress?.(event);
    }

    renderField(content: JSX.Element | JSX.Element[]) {
        let { theme } = this.props;
        let {
            onPress,
            disabled,
            style = {},
            align = 'left',
            rippleColor = theme.colors.primary + '60',
        } = this.props;

        let styles: StyleProp<ViewStyle> = [
            {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: kJustifyTextAlignMap[align],
                borderRadius: theme.roundness,
                overflow: 'hidden',
            },
            style,
        ];

        if (onPress) {
            return (
                <TouchableRipple
                    onPress={event => {
                        this.handlePress(event);
                    }}
                    rippleColor={rippleColor}
                    underlayColor={rippleColor}
                    style={styles}
                    disabled={disabled}
                    theme={theme}
                >
                    {content}
                </TouchableRipple>
            );
        } else {
            return <View style={styles}>{content}</View>;
        }
    }

    renderTitleAndValue() {
        let { label = '', placeholder = '', theme, textStyle } = this.props;
        let { value } = this.state;
        let valueStr = this.format(value);

        return (
            <View style={{ flex: 1 }}>
                {!!label && (
                    <Caption
                        selectable={false}
                        style={[
                            {
                                lineHeight: 12,
                                color: theme.colors.placeholder,
                            },
                            textStyle,
                        ]}
                    >
                        {label}
                    </Caption>
                )}
                {!!(valueStr || placeholder) && (
                    <Text
                        selectable={false}
                        style={[
                            {
                                flex: 1,
                                color: valueStr
                                    ? theme.colors.text
                                    : theme.colors.placeholder,
                            },
                            textStyle,
                        ]}
                        theme={theme}
                    >
                        {valueStr || placeholder || ''}
                    </Text>
                )}
            </View>
        );
    }

    renderContent(): JSX.Element | JSX.Element[] {
        return this.renderTitleAndValue();
    }

    renderCustom(): JSX.Element | JSX.Element[] {
        return <View />;
    }

    render() {
        if (this.isCustom) {
            return this.renderCustom();
        }
        return this.renderField(this.renderContent());
    }
}
