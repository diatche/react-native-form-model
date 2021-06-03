import React from 'react';
import { StyleSheet, TextProps, View, ViewProps } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { PaperThemeWithForm } from '../models/FormStyle';

export interface FormLabelProps extends ViewProps {
    title: string | undefined;
    onPress?: TextProps['onPress'];
    textStyle?: TextProps['style'];
}

export default function FormLabel({
    title,
    onPress,
    style,
    textStyle,
    ...props
}: FormLabelProps) {
    const theme = useTheme() as PaperThemeWithForm;
    if (typeof title === 'undefined') {
        title = '';
    } else if (typeof title === 'string') {
        title = String(title);
    }
    return (
        <View {...props} style={[styles.container, style]}>
            <Text
                onPress={onPress}
                style={[styles.text, textStyle]}
                theme={theme}
            >
                {title}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        width: '100%',
    },
});
