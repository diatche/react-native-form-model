import React from 'react';
import {
    StyleProp,
    StyleSheet,
    TextProps,
    TextStyle,
    TouchableHighlightProps,
    TouchableOpacity,
    View,
    ViewProps,
    ViewStyle,
} from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

import { PaperThemeWithForm } from '../models/FormStyle';

export interface ChildProps extends ViewProps {
    color?: string;
}

export interface TitleProps extends TextProps {
    color?: string;
}

export interface ButtonProps extends TouchableHighlightProps {
    title: string | ((props: TitleProps) => React.ReactNode);
    icon?: null | false | ((props: ChildProps) => React.ReactNode);
    mode?: 'contained' | 'outline' | 'text';
    compact?: boolean;
    loading?: boolean;
    contentContainerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    numberOfLines?: number;
    color?: string;
    activityIndicatorSize?: number;
}

const Button: React.FC<ButtonProps> = ({
    title = '',
    icon,
    mode = 'text',
    compact = false,
    style,
    contentContainerStyle,
    textStyle,
    numberOfLines,
    disabled,
    loading = false,
    color,
    activityIndicatorSize = 20,
    ...otherProps
}) => {
    const theme = useTheme() as PaperThemeWithForm;
    const primaryColor = color || theme.colors.primary;
    let stateColor = disabled ? theme.colors.disabled : primaryColor;
    const containerStyle: ViewStyle = {
        borderRadius: theme.roundness,
    };
    let accessoryStyle: StyleProp<ViewStyle> | undefined = undefined;
    if (compact) {
        if (typeof numberOfLines === 'undefined') {
            numberOfLines = 1;
        }
    } else {
        accessoryStyle = styles.nonCompactAccessory;
    }

    switch (mode) {
        case 'contained':
            containerStyle.backgroundColor = stateColor;
            stateColor = theme.colors.background;
            break;
        case 'outline':
            containerStyle.borderColor = stateColor;
            containerStyle.borderWidth = 1;
            break;
    }

    const titleProps: TitleProps = {
        selectable: false,
        color: stateColor,
        style: [styles.buttonText, { color: stateColor }, textStyle],
        adjustsFontSizeToFit: true,
        minimumFontScale: 0.6,
        numberOfLines,
    };
    const titleView =
        typeof title === 'string' ? (
            <Text {...titleProps}>{title || ''}</Text>
        ) : (
            title(titleProps)
        );
    const activity = () => (
        <ActivityIndicator
            hidesWhenStopped
            animating={loading}
            size={activityIndicatorSize}
            style={[styles.accessory, accessoryStyle]}
            color={primaryColor}
        />
    );

    let buttonContent: React.ReactNode = null;
    if (compact) {
        buttonContent = (
            <View style={[styles.compactInnerContainer, contentContainerStyle]}>
                {loading
                    ? activity()
                    : icon
                    ? icon({ color: stateColor })
                    : titleView}
            </View>
        );
    } else {
        buttonContent = (
            <View style={[styles.innerContainer, contentContainerStyle]}>
                <View style={[styles.accessory, accessoryStyle]} />
                <Flex />
                {icon ? icon({ color: stateColor }) : null}
                {titleView}
                <Flex />
                {activity()}
            </View>
        );
    }

    return (
        <TouchableOpacity
            {...otherProps}
            style={[
                compact ? styles.compactContainer : styles.container,
                containerStyle,
                style,
            ]}
            disabled={!!disabled}
        >
            {buttonContent}
        </TouchableOpacity>
    );
};

const Flex = () => <View style={styles.flex} />;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        overflow: 'hidden',
    },
    compactContainer: {
        paddingHorizontal: 8,
        marginVertical: 4,
        overflow: 'hidden',
    },
    accessory: {
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nonCompactAccessory: {
        width: 40,
    },
    compactInnerContainer: {
        flexShrink: 1,
        flexGrow: 1,
        flexBasis: 40,
        justifyContent: 'center',
    },
    innerContainer: {
        flex: 1,
        minHeight: 40,
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        flexShrink: 1,
        fontSize: 16,
        lineHeight: 24,
        paddingHorizontal: 4,
        textAlign: 'center',
    },
    flex: {
        flex: 1,
    },
});

export default Button;
