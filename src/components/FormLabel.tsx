import React from 'react';
import {
    StyleSheet,
    TextProps,
    TouchableOpacity,
    View,
    ViewProps,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { PaperThemeWithForm } from '../models/FormStyle';

export interface FormLabelProps extends ViewProps {
    title: string | undefined;
    onPress?: TextProps['onPress'];
    textStyle?: TextProps['style'];
    selectable?: boolean;
}

export default React.memo(function FormLabel({
    title,
    onPress,
    style,
    textStyle,
    selectable,
    ...props
}: FormLabelProps) {
    const theme = useTheme() as PaperThemeWithForm;
    if (typeof title === 'undefined') {
        title = '';
    } else if (typeof title === 'string') {
        title = String(title);
    }
    const label = (
        <Text
            selectable={selectable}
            style={[styles.text, textStyle]}
            theme={theme}
        >
            {title}
        </Text>
    );
    return onPress ? (
        <TouchableOpacity
            {...props}
            onPress={onPress}
            style={[styles.container, style]}
        >
            {label}
        </TouchableOpacity>
    ) : (
        <View {...props} style={[styles.container, style]}>
            {label}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        width: '100%',
    },
});
