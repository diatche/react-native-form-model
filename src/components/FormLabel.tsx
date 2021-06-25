import React from 'react';
import {
    StyleSheet,
    TextProps,
    TouchableOpacity,
    View,
    ViewProps,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { FieldAlignment } from '../models/FieldModel';
import { PaperThemeWithForm } from '../models/FormStyle';
import { kAlignmentToJustifyContentMap } from './styleUtil';

export interface FormLabelProps extends ViewProps {
    title: string | undefined;
    onPress?: TextProps['onPress'];
    textStyle?: TextProps['style'];
    selectable?: boolean;
    align?: FieldAlignment;
}

export default React.memo(function FormLabel({
    title,
    onPress,
    style,
    textStyle,
    selectable,
    align = 'left',
    ...props
}: FormLabelProps) {
    const theme = useTheme() as PaperThemeWithForm;
    const justifyContent = kAlignmentToJustifyContentMap[align];
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
            adjustsFontSizeToFit={true}
            minimumFontScale={0.6}
        >
            {title}
        </Text>
    );
    return onPress ? (
        <TouchableOpacity
            {...props}
            onPress={onPress}
            style={[styles.container, { justifyContent }, style]}
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
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {},
});
