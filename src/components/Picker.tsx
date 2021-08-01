import React from 'react';
import { Picker as NativePicker } from '@react-native-picker/picker';
import {
    LayoutChangeEvent,
    Platform,
    ScrollView,
    StyleProp,
    StyleSheet,
    TextStyle,
    View,
    ViewProps,
    ViewStyle,
} from 'react-native';
import FormLabel from './FormLabel';
import { Modal, Portal, useTheme } from 'react-native-paper';
import { PaperThemeWithForm } from '../models/FormStyle';
import OptionList from './OptionList';
import _ from 'lodash';

// TODO: Background color is not supported or broken on Android. See [issue](https://github.com/react-native-picker/picker/issues/112)

const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';
const isWeb = Platform.OS === 'web';

/**
 * If the native OS picker does not present a modal, set to true.
 */
const isInlinePicker = isIOS;

/**
 * If the OS can handle picker modal presentation, set to true.
 *
 * Android does handle both dropdowns and dialogs, but bugs
 * inside @react-native-picker/picker prevent dialogs
 * from being used.
 */
const nativeModalHandler = false;

const kMaxDialogHeight = 500;

export interface PickerProps<T = any> extends ViewProps {
    possibleValues: T[];
    formatValue: (value: T | undefined, index: number) => string;
    disabled?: boolean;
    align?: 'left' | 'center' | 'right';
    /**
     * Selected index, correspoding to `possibleValues`.
     */
    selectedIndex: number;
    /**
     * Callback for when an item is selected. This is called with the following parameters:
     *   - `value`: the value that was selected
     *   - `index`: the index of the selected value
     */
    onValueChange?: (value: T, index: number) => void;
    /**
     * Specifies how to display the selection items when the user taps on the picker:
     *
     *   - 'dropdown': Shows a dropdown anchored to the picker view. This is the default. Not supported in iOS.
     *   - 'dialog': Show a modal dialog.
     */
    mode?: 'dialog' | 'dropdown';
    /**
     * Style to apply to each of the item labels.
     * @platform ios
     */
    itemStyle?: StyleProp<TextStyle>;
    /**
     * Prompt string for this picker, used in dialog mode as the title of the dialog.
     */
    prompt?: string;
    /**
     * Used to locate this view in end-to-end tests.
     */
    testID?: string;
    /**
     * Color of arrow for spinner dropdown in hexadecimal format
     */
    dropdownIconColor?: string;
    /**
     * Color of the picker items.
     */
    itemColor?: string;
}

export default function Picker<T = any>({
    possibleValues,
    formatValue,
    selectedIndex,
    onValueChange,
    disabled,
    align = 'left',
    mode,
    prompt,
    style,
    itemStyle,
    itemColor,
    ...pickerProps
}: PickerProps<T>): JSX.Element | null {
    const theme = useTheme() as PaperThemeWithForm;
    const [visible, setVisible] = React.useState(false);
    const pickerOverrides = {
        selectedValue: selectedIndex,
        mode,
        prompt,
        enabled: !disabled,
        onValueChange: onValueChange
            ? (value: number, index: number) => {
                  onValueChange(possibleValues[index], index);
              }
            : undefined,
    };

    // If we display a dialog, we need to measure the content
    // to size the modal appropriately as this is done
    // automatically only on web.
    const displayDialog =
        !isInlinePicker && !nativeModalHandler && mode === 'dialog';
    const [optionsDialogHeight, setOptionsDialogHeight] =
        React.useState<number>(0);
    let modalStyle: ViewStyle | undefined;
    let onDialogLayout: ((event: LayoutChangeEvent) => void) | undefined;
    if (displayDialog && !isWeb) {
        modalStyle = optionsDialogHeight
            ? {
                  height: Math.min(kMaxDialogHeight, optionsDialogHeight),
              }
            : { opacity: 0 };
        onDialogLayout = event => {
            const newHeight = event.nativeEvent.layout.height;
            if (optionsDialogHeight !== newHeight) {
                setOptionsDialogHeight(newHeight);
            }
        };
    }

    const createPickerItems = () =>
        possibleValues.map((value, i) => (
            <NativePicker.Item
                key={i}
                label={formatValue(value, i)}
                value={i}
                color={itemColor}
            />
        ));

    if (isInlinePicker || displayDialog) {
        return (
            <View style={[styles.container, style]}>
                <FormLabel
                    title={formatValue(
                        possibleValues[selectedIndex],
                        selectedIndex
                    )}
                    align={align}
                    style={[styles.label, itemStyle]}
                    textStyle={itemStyle}
                    onPress={() => setVisible(true)}
                    disabled={disabled}
                />
                <Portal theme={theme}>
                    <Modal
                        visible={visible && !disabled}
                        onDismiss={() => setVisible(false)}
                        contentContainerStyle={[
                            styles.modal,
                            {
                                backgroundColor: theme.colors.surface,
                                borderRadius: theme.roundness,
                            },
                            modalStyle,
                        ]}
                        theme={theme}
                    >
                        {isInlinePicker ? (
                            <NativePicker
                                {...pickerProps}
                                {...pickerOverrides}
                                style={[
                                    styles.pickerOverride,
                                    isWeb ? kPickerWebStyle : undefined,
                                ]}
                                itemStyle={[
                                    itemStyle,
                                    styles.pickerItemStyleOverride,
                                ]}
                            >
                                {createPickerItems()}
                            </NativePicker>
                        ) : (
                            <ScrollView>
                                <OptionList
                                    title={prompt}
                                    items={possibleValues}
                                    selectedIndex={selectedIndex}
                                    onSelect={(value, index) => {
                                        onValueChange?.(value, index);
                                        setVisible(false);
                                    }}
                                    formatItem={formatValue}
                                    itemColor={itemColor}
                                    chechmarkColor={itemColor}
                                    onLayout={onDialogLayout}
                                />
                            </ScrollView>
                        )}
                    </Modal>
                </Portal>
            </View>
        );
    } else {
        return (
            <NativePicker
                {...pickerProps}
                {...pickerOverrides}
                style={[
                    styles.inlinePicker,
                    style,
                    styles.pickerOverride,
                    isWeb ? kPickerWebStyle : undefined,
                ]}
                itemStyle={[itemStyle, styles.pickerItemStyleOverride]}
            >
                {createPickerItems()}
            </NativePicker>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    label: {
        flex: 1,
    },
    modal: {
        minWidth: 320,
        maxWidth: 400,
        maxHeight: kMaxDialogHeight,
        alignSelf: 'center',
        overflow: 'hidden',
    },
    inlinePicker: {
        minWidth: 320,
    },
    pickerOverride: (() => {
        switch (Platform.OS) {
            case 'ios':
                return { width: 320 };
            default:
                return {};
        }
    })() as TextStyle,
    pickerItemStyleOverride: (() => {
        switch (Platform.OS) {
            case 'ios':
                return { textAlign: 'center' };
            case 'android':
                return { marginHorizontal: 12 };
            default:
                return {};
        }
    })() as TextStyle,
});

const kPickerWebStyle: any = {
    /** Remove browser specific styling. */
    appearance: 'none',
    borderWidth: 0,
};
