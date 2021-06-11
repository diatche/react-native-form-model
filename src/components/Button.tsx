import React from 'react';
import {
    StyleProp,
    StyleSheet,
    TextProps,
    TextStyle,
    TouchableHighlightProps,
    View,
    ViewProps,
    ViewStyle,
} from 'react-native';
import {
    ActivityIndicator,
    Text,
    TouchableRipple,
    useTheme,
} from 'react-native-paper';
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
    disabled,
    loading = false,
    color,
    activityIndicatorSize = 20,
    ...otherProps
}) => {
    const theme = useTheme() as PaperThemeWithForm;
    let primaryColor = color || theme.colors.primary;
    let stateColor = disabled ? theme.colors.disabled : primaryColor;
    let containerStyle: ViewStyle = {
        borderRadius: theme.roundness,
    };
    const selectColor = transparent(stateColor);
    let accessoryStyle: StyleProp<ViewStyle> | undefined = undefined;
    if (!compact) {
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
    };
    const titleView =
        typeof title === 'string' ? (
            <Text {...titleProps}>{title || ''}</Text>
        ) : (
            title(titleProps)
        );
    const activity = () => (
        <ActivityIndicator
            hidesWhenStopped={true}
            animating={loading}
            size={activityIndicatorSize}
            style={[styles.accessory, accessoryStyle]}
            color={primaryColor}
        />
    );

    let buttonContent: React.ReactNode = null;
    if (compact) {
        buttonContent = (
            <View style={[styles.compactContainerStyle, contentContainerStyle]}>
                {loading ? activity() : titleView}
            </View>
        );
    } else {
        buttonContent = (
            <View style={[styles.containerStyle, contentContainerStyle]}>
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
        <View
            style={[
                compact ? styles.compactContainer : styles.container,
                containerStyle,
                style,
            ]}
        >
            <TouchableRipple
                {...otherProps}
                style={styles.touchable}
                rippleColor={selectColor}
                underlayColor={selectColor}
                disabled={!!disabled}
            >
                {buttonContent}
            </TouchableRipple>
        </View>
    );
};

const transparent = (color: string) => color + '60';

const Flex = () => <View style={styles.flex} />;

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    compactContainer: {
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
    touchable: {
        paddingHorizontal: 8,
    },
    compactContainerStyle: {
        flexShrink: 1,
        flexBasis: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    containerStyle: {
        flex: 1,
        minHeight: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    buttonText: {
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
