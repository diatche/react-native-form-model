import React from 'react';
import { Platform, StyleSheet, TextInputProps, ViewProps } from 'react-native';
import { TouchableRipple, useTheme } from 'react-native-paper';

import { PaperThemeWithForm } from '../models/FormStyle';
import FormAssets from './FormAssets';

const isIOS = Platform.OS === 'ios';

export interface ClearButtonProps extends ViewProps {
    color?: string;
    disabled?: boolean;
    onPress?: () => void;
}

export default function ClearButton({
    color,
    disabled,
    onPress,
}: ClearButtonProps) {
    const theme = useTheme() as PaperThemeWithForm;

    color = color || theme.form.colors.input;
    let rippleColor = color;
    if (rippleColor) {
        rippleColor += '60';
    }

    React.useEffect(() => {
        if (!FormAssets.shared.ClearIcon) {
            console.warn('Missing FormAssets.shared.ClearIcon');
        }
    }, []);

    return (
        <TouchableRipple
            disabled={disabled}
            style={[
                styles.ripple,
                {
                    borderRadius: theme.roundness,
                },
            ]}
            rippleColor={rippleColor}
            underlayColor={rippleColor}
            onPress={onPress}
        >
            {FormAssets.shared.ClearIcon && (
                <FormAssets.shared.ClearIcon size={22} color={color} />
            )}
        </TouchableRipple>
    );
}

export function shouldShowClearButtonOnTextField(
    clearButtonMode: TextInputProps['clearButtonMode'],
    editing: boolean
): boolean {
    return isIOS || clearButtonMode === 'never'
        ? false
        : clearButtonMode === 'always' ||
              (clearButtonMode === 'while-editing' && editing) ||
              (clearButtonMode === 'unless-editing' && !editing);
}

const styles = StyleSheet.create({
    ripple: {
        marginLeft: 6,
        overflow: 'hidden',
    },
});
