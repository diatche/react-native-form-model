import moment from 'moment';
import React from 'react';
import {
    Platform,
    StyleSheet,
    TextStyle,
    View,
    ViewProps,
    ViewStyle,
} from 'react-native';
import { Switch, useTheme } from 'react-native-paper';
import { PaperThemeWithForm } from '../models/FormStyle';
import {
    useBehaviorSubject,
    useObservable,
    useObservableIfNeeded,
} from '../util/reactUtil';
import {
    CustomFieldModel,
    DateInputFieldModel,
    FieldModel,
    KeyboardInputFieldModel,
    LabelFieldModel,
    OptionInputFieldModel,
    SwitchInputFieldModel,
    TimeInputFieldModel,
} from '../models';
import FormLabel from './FormLabel';
import SegmentedControl from './SegmentedControl';
import TextInputField from './TextInputField';
import TimeInputField from './TimeInputField';
import { kAlignmentToJustifyContentMap } from './styleUtil';
import ErrorFieldModel from '../models/FieldModel/ErrorFieldModel';
import InputFieldModel, {
    InputFieldState,
} from '../models/FieldModel/InputFieldModel';
import DatePicker from './DatePicker';
import Picker, { PickerItem } from './Picker';
import { BehaviorSubject } from 'rxjs';

// TODO: Optimise updates with React.memo().

export interface FormFieldProps extends ViewProps {
    field: FieldModel;
}

const FormField: React.FC<FormFieldProps> = ({
    field,
    style: styleProp,
    ...otherProps
}: FormFieldProps) => {
    const theme = useTheme() as PaperThemeWithForm;
    const formStyle = field.resolveStyle(theme.form);
    const justifyContent = kAlignmentToJustifyContentMap[field.align];
    const innerContainerStyle: ViewStyle = {
        flex: field.flex,
        justifyContent,
    };
    const containerStyle: ViewStyle = {
        ...innerContainerStyle,
        marginLeft: formStyle.marginLeft,
        marginRight: formStyle.marginRight,
        marginTop: formStyle.marginTop,
        marginBottom: formStyle.marginBottom,
        paddingLeft: formStyle.paddingLeft,
        paddingRight: formStyle.paddingRight,
        paddingTop: formStyle.paddingTop,
        paddingBottom: formStyle.paddingBottom,
    };
    const fieldWithBorderStyle: ViewStyle = {
        ...getFieldWithBorderStyle(theme),
        borderRadius: Math.max(0, formStyle.roundness - 3),
        borderWidth: 0,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3,
        paddingLeft: formStyle.paddingLeft + formStyle.marginLeft - 3,
        paddingRight: formStyle.paddingRight + formStyle.marginRight - 3,
        paddingTop: formStyle.paddingTop + formStyle.marginTop - 3,
        paddingBottom: formStyle.paddingBottom + formStyle.marginBottom - 3,
    };
    const errors = useBehaviorSubject(field.errors);
    const showError = useBehaviorSubject(
        field instanceof InputFieldModel
            ? field.edited
            : new BehaviorSubject(true)
    );
    const isErrorLabel = field instanceof ErrorFieldModel;
    const isDisabled = field instanceof InputFieldModel && field.disabled;
    const hasError = isErrorLabel || (showError && errors.length !== 0);
    const textStyle: TextStyle = {
        fontSize: isErrorLabel ? formStyle.errorFontSize : formStyle.fontSize,
        fontWeight: formStyle.fontWeight,
        textAlign: field.align,
    };
    const labelTextStyle: TextStyle = {
        ...textStyle,
        color: hasError ? formStyle.colors.error : formStyle.colors.label,
    };
    const inputColor = isDisabled
        ? formStyle.colors.disabled || theme.colors.disabled
        : hasError
        ? formStyle.colors.error || theme.colors.error
        : formStyle.colors.input || theme.colors.primary;
    const inputTextStyle: TextStyle = {
        ...textStyle,
        fontWeight: formStyle.inputFontWeight,
        color: inputColor,
    };

    let invisibleContainerField: JSX.Element | undefined;
    let inlineViews: React.ReactNode[] = [];

    if (field instanceof LabelFieldModel) {
        const { value: title } = useObservableIfNeeded(field.title);
        inlineViews.push(
            <FormLabel
                key={field.key}
                title={title}
                style={styles.label}
                textStyle={[
                    styles.labelText,
                    labelTextStyle,
                    field.color ? { color: field.color } : {},
                ]}
            />
        );
    } else if (field instanceof SwitchInputFieldModel) {
        const { value } = useObservableIfNeeded(field.value);
        inlineViews.push(
            <View key={field.key} style={styles.switchContainer}>
                <Switch
                    value={value}
                    onValueChange={value => field.setInput(value)}
                    disabled={field.disabled}
                />
            </View>
        );
    } else if (field instanceof KeyboardInputFieldModel) {
        const fieldRef = React.useRef<TextInputField>(null);
        field.viewRef = fieldRef;
        const value = useBehaviorSubject(field.value, [field], {
            onChange: () => {
                if (!field.valid()) {
                    fieldRef.current?.reset();
                    editingStateRef.current = field.getState();
                }
            },
        });
        const editingStateRef =
            React.useRef<InputFieldState<any> | undefined>(undefined);
        invisibleContainerField = (
            <TextInputField
                {...otherProps}
                ref={fieldRef}
                key={field.key}
                value={value}
                disabled={field.disabled}
                placeholder={field.placeholder}
                onValueChange={state => {
                    editingStateRef.current = state;

                    if (field.submitOnChangeValue) {
                        field.setState(state);
                        return;
                    }
                    if (
                        Math.abs(
                            (state.value?.length || 0) -
                                (editingStateRef.current.value?.length || 0)
                        ) > 1
                    ) {
                        // Probably used autocomplete. Set state now.
                        field.setState(state);
                    }
                }}
                onBlur={() =>
                    editingStateRef.current &&
                    field.setState(editingStateRef.current)
                }
                parse={x => field.parseState(x)}
                format={x => field.formatValue(x)}
                validate={x => field.normalizedValidationResult(x)}
                multiline={field.multiline}
                keyboardType={field.keyboardType}
                textContentType={field.textContentType}
                autoCapitalize={field.autoCapitalize}
                secure={field.type === 'secure'}
                autoFocus={field.autoFocus}
                clearTextOnFocus={field.clearTextOnFocus}
                align={field.align}
                style={[
                    styles.container,
                    containerStyle,
                    fieldWithBorderStyle,
                    styleProp,
                ]}
                textStyle={inputTextStyle}
                theme={theme}
            />
        );
    } else if (field instanceof DateInputFieldModel) {
        const { value: date } = useObservable(field.value);
        const isIntegrated = DatePicker.isIntegrated({ mode: 'time' });
        const [editing, setEditing] = isIntegrated
            ? [true, () => {}]
            : React.useState(false);
        if (!isIntegrated) {
            const { value: dateString = '' } = useObservable(
                () => field.formattedValue(),
                [field.value]
            );
            inlineViews.push(
                <FormLabel
                    key={`${field.key}_label`}
                    title={dateString}
                    onPress={() => {
                        if (!editing) {
                            setEditing(true);
                        }
                    }}
                    style={styles.field}
                    textStyle={inputTextStyle}
                />
            );
        }
        if (isIntegrated || !field.disabled) {
            let picker = (
                <DatePicker
                    key={`${field.key}_picker`}
                    value={date}
                    submitOnChange={true}
                    onSubmit={date => {
                        setEditing(false);
                        field.setInput(date);
                    }}
                    onCancel={() => setEditing(false)}
                    visible={editing}
                    mode='date'
                    futureDisabled={field.futureDisabled}
                    theme={theme}
                    align={field.align}
                    style={
                        isIntegrated
                            ? [
                                  styles.container,
                                  containerStyle,
                                  fieldWithBorderStyle,
                              ]
                            : undefined
                    }
                />
            );
            if (isIntegrated) {
                invisibleContainerField = picker;
            } else {
                inlineViews.push(picker);
            }
        }
    } else if (field instanceof TimeInputFieldModel) {
        const time = useBehaviorSubject(field.value, [field]);
        if (DatePicker.isTimePickerSupported) {
            const dateValue = moment().startOf('day').add(time);
            const isIntegrated = DatePicker.isIntegrated({ mode: 'time' });
            const [editing, setEditing] = isIntegrated
                ? [true, () => {}]
                : React.useState(false);
            if (!isIntegrated) {
                inlineViews.push(
                    <FormLabel
                        key={`${field.key}_label`}
                        title={field.formatTime(time)}
                        onPress={() => {
                            if (!editing) {
                                setEditing(true);
                            }
                        }}
                        style={styles.field}
                        textStyle={inputTextStyle}
                    />
                );
            }
            if (isIntegrated || !field.disabled) {
                let picker = (
                    <DatePicker
                        key={`${field.key}_picker`}
                        value={dateValue}
                        disabled={field.disabled}
                        submitOnChange={true}
                        onSubmit={date => {
                            setEditing(false);
                            let time = moment.duration(
                                date.diff(date.clone().startOf('day'))
                            );
                            field.setInput(time);
                        }}
                        onCancel={() => setEditing(false)}
                        visible={editing}
                        mode='time'
                        // futureDisabled={field.futureDisabled}
                        theme={theme}
                        align={field.align}
                        style={
                            isIntegrated
                                ? [
                                      styles.container,
                                      containerStyle,
                                      fieldWithBorderStyle,
                                  ]
                                : undefined
                        }
                    />
                );
                if (isIntegrated) {
                    invisibleContainerField = picker;
                } else {
                    inlineViews.push(picker);
                }
            }
        } else {
            const fieldRef = React.useRef<TimeInputField>(null);
            field.viewRef = fieldRef;
            const editingStateRef =
                React.useRef<InputFieldState<any> | undefined>(undefined);
            invisibleContainerField = (
                <TimeInputField
                    {...otherProps}
                    ref={fieldRef}
                    key={field.key}
                    value={time}
                    disabled={field.disabled}
                    autoFocus={field.autoFocus}
                    format={time => field.formatTime(time)}
                    validate={x => field.normalizedValidationResult(x)}
                    placeholder={field.formatDate(moment())}
                    onValueChange={state => {
                        editingStateRef.current = state;
                    }}
                    onBlur={() =>
                        editingStateRef.current &&
                        field.setState(editingStateRef.current)
                    }
                    align={field.align}
                    style={[
                        styles.container,
                        containerStyle,
                        fieldWithBorderStyle,
                        styleProp,
                    ]}
                    textStyle={inputTextStyle}
                    theme={theme}
                />
            );
        }
    } else if (field instanceof OptionInputFieldModel) {
        switch (field.type) {
            case 'segmentedControl': {
                const controlStyle: ViewStyle = { justifyContent };
                const { value: selectedIndex } = useObservable(
                    () => field.selectedIndex(),
                    [field.value]
                );
                invisibleContainerField = (
                    <SegmentedControl
                        key={`${field.key}_segmentedControl`}
                        selectedIndex={selectedIndex}
                        disabled={field.disabled}
                        possibleValues={field.possibleValues.map(value =>
                            field.formatValue(value)
                        )}
                        optional={field.optional}
                        color={inputColor}
                        clearButtonMode={field.clearButtonMode}
                        onSelect={i => field.selectIndex(i)}
                        style={[
                            styles.container,
                            containerStyle,
                            fieldWithBorderStyle,
                        ]}
                        textStyle={inputTextStyle}
                    />
                );
                break;
            }
            case 'picker': {
                const { value } = useObservable(field.value);
                let possibleValues = field.possibleValues;
                if (field.optional) {
                    possibleValues = [undefined, ...possibleValues];
                }
                invisibleContainerField = (
                    <Picker
                        key={`${field.key}_picker`}
                        selectedValue={value}
                        selectedTitle={field.formatValue(value)}
                        style={[
                            styles.container,
                            containerStyle,
                            fieldWithBorderStyle,
                            inputTextStyle,
                        ]}
                        mode='dropdown'
                        disabled={field.disabled}
                        itemStyle={inputTextStyle}
                        onValueChange={(value, index) => field.setInput(index)}
                        dropdownIconColor={inputColor}
                    >
                        {possibleValues.map((value, i) => (
                            <PickerItem
                                key={i}
                                label={field.formatValue(value)}
                                value={value}
                                color={inputColor}
                            />
                        ))}
                    </Picker>
                );
                break;
            }
            default:
                throw new Error(
                    `Unknown ${field.constructor.name}#type: ${field.type}`
                );
        }
    } else if (field instanceof InputFieldModel) {
        const { value } = useObservable(field.value, [], {
            // Update state to run validator and other hooks
            onChange: value => field.setInput(value),
        });
        inlineViews.push(
            <FormLabel
                key={field.key}
                title={field.formatValue(value) || field.placeholder}
                style={styles.label}
                textStyle={[styles.labelText, inputTextStyle]}
            />
        );
    } else if (field instanceof CustomFieldModel) {
        inlineViews.push(
            <View key={field.key} style={styles.customField}>
                {field.render({ style: textStyle })}
            </View>
        );
    }

    // inlineViews.push(
    //     <HelperText
    //         type='error'
    //         visible={hasError}
    //         style={[styles.helperText, { textAlign: field.align }]}
    //     >
    //         {errors
    //             .map(error => (error?.message || error || '').toString())
    //             .join('\n')}
    //     </HelperText>
    // );

    React.useEffect(() => {
        field.isMounted = true;
        field.onMount();
        return () => {
            field.onUnmount();
            field.isMounted = false;
            if (field instanceof InputFieldModel) {
                field.viewRef = undefined;
            }
        };
    }, [field]);

    return invisibleContainerField ? (
        <View style={styles.invisibleContainer}>{invisibleContainerField}</View>
    ) : (
        <View
            {...otherProps}
            style={[styles.container, containerStyle, styleProp]}
        >
            {inlineViews}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    invisibleContainer: { flex: 1 },
    label: {
        flex: 1,
    },
    labelText: {
        fontSize: 14,
    },
    field: {
        flex: 1,
    },
    customField: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'center',
    },
    helperText: {
        paddingLeft: 6,
        paddingRight: 6,
        paddingBottom: 0,
        paddingTop: 0,
    },
    switchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
});

const getFieldWithBorderStyle = (theme: PaperThemeWithForm) => {
    // We selectively apply backround, because web needs it,
    // and Android has a bug with background color when using
    // it with Picker.
    switch (Platform.OS) {
        case 'web':
            return {
                backgroundColor: theme.colors.surface,
            };
        default:
            return {};
    }
};

export default FormField;
