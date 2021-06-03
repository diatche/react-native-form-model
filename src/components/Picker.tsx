import React from 'react';
import { Picker as NativePicker } from '@react-native-picker/picker';
import {
    Platform,
    StyleProp,
    StyleSheet,
    TextStyle,
    View,
    ViewProps,
} from 'react-native';
import FormLabel from './FormLabel';
import { Modal, Portal, useTheme } from 'react-native-paper';
import { PaperThemeWithForm } from '../models/FormStyle';

// TODO: Background color is not supported or broken on Android. See [issue](https://github.com/react-native-picker/picker/issues/112)

const isIOS = Platform.OS === 'ios';
const isWeb = Platform.OS === 'web';

const isInlinePicker = isIOS;

export interface PickerProps<T = any> extends ViewProps {
    children: React.ReactNode | React.ReactNode[];
    selectedTitle: string;
    disabled?: boolean;
    /**
     * Value matching value of one of the items. Can be a string or an integer.
     */
    selectedValue?: T;
    /**
     * Callback for when an item is selected. This is called with the following parameters:
     *   - `itemValue`: the `value` prop of the item that was selected
     *   - `itemIndex`: the index of the selected item in this picker
     */
    onValueChange?: (itemValue: T, itemIndex: number) => void;
    /**
     * On Android, specifies how to display the selection items when the user taps on the picker:
     *
     *   - 'dialog': Show a modal dialog. This is the default.
     *   - 'dropdown': Shows a dropdown anchored to the picker view
     *
     * @platform android
     */
    mode?: 'dialog' | 'dropdown';
    /**
     * Style to apply to each of the item labels.
     * @platform ios
     */
    itemStyle?: StyleProp<TextStyle>;
    /**
     * Prompt string for this picker, used on Android in dialog mode as the title of the dialog.
     * @platform android
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
}

export default function Picker<T = any>({
    selectedTitle,
    children,
    disabled,
    style,
    itemStyle,
    ...props
}: PickerProps<T>): JSX.Element | null {
    const theme = useTheme() as PaperThemeWithForm;
    const [visible, setVisible] = React.useState(false);

    if (isInlinePicker) {
        return (
            <View style={[styles.container, style]}>
                <FormLabel
                    title={selectedTitle}
                    style={itemStyle}
                    textStyle={itemStyle}
                    onPress={() => setVisible(true)}
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
                        ]}
                        theme={theme}
                    >
                        <NativePicker
                            {...props}
                            enabled={!disabled}
                            style={[
                                styles.pickerOverride,
                                isWeb ? kPickerWebStyle : undefined,
                            ]}
                            itemStyle={[
                                itemStyle,
                                styles.pickerItemStyleOverride,
                            ]}
                        >
                            {children}
                        </NativePicker>
                    </Modal>
                </Portal>
            </View>
        );
    } else {
        return (
            <NativePicker
                {...props}
                enabled={!disabled}
                style={[
                    styles.inlinePicker,
                    style,
                    styles.pickerOverride,
                    isWeb ? kPickerWebStyle : undefined,
                ]}
                itemStyle={[itemStyle, styles.pickerItemStyleOverride]}
            >
                {children}
            </NativePicker>
        );
    }
}

export const PickerItem = NativePicker.Item;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modal: {
        maxWidth: 400,
        alignSelf: 'center',
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
