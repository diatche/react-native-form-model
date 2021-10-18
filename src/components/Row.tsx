import React from 'react';
import {
    StyleProp,
    StyleSheet,
    View,
    ViewProps,
    ViewStyle,
} from 'react-native';
import { IconButton, TouchableRipple, useTheme } from 'react-native-paper';

import { PaperThemeWithForm } from '../models/FormStyle';

export interface RowProps extends ViewProps {
    onPress?: (event: any) => void;
    onDelete?: (event: any) => void;
    rightAccessory?: (props: ViewProps) => React.ReactNode;
    disabled?: boolean;
    children?: any;
    showDelete?: boolean;
    isTop?: boolean;
    isBottom?: boolean;
    isSingle?: boolean;
    style?: StyleProp<ViewStyle>;
    rippleColor?: string;
    /** If true, content has no margins or padding. */
    fillContent?: boolean;
    contentContainerStyle?: StyleProp<ViewStyle>;
}

const Row: React.FC<RowProps> = ({
    onPress,
    onDelete,
    rightAccessory: renderRightAccessory,
    disabled,
    children,
    showDelete = false,
    isTop = false,
    isBottom = false,
    isSingle = false,
    style,
    rippleColor,
    fillContent = false,
    contentContainerStyle,
    ...otherProps
}) => {
    const theme = useTheme() as PaperThemeWithForm;
    rippleColor = (rippleColor || theme.colors.primary) + '60';

    const mergedStyle: any[] = [styles.row];
    if (!fillContent) {
        mergedStyle.push(styles.rowPad);
    }

    if (isTop || isSingle) {
        mergedStyle.push(styles.rowTop);
        mergedStyle.push({
            borderTopLeftRadius: theme.roundness,
            borderTopRightRadius: theme.roundness,
        });
    }
    if (isBottom || isSingle) {
        mergedStyle.push(styles.rowBottom);
        mergedStyle.push({
            borderBottomLeftRadius: theme.roundness,
            borderBottomRightRadius: theme.roundness,
        });
    }

    mergedStyle.push({
        backgroundColor: theme.colors.surface,
    });
    mergedStyle.push(style);

    let rightAccessory: any;
    if (showDelete) {
        rightAccessory = (
            <IconButton
                key='delete-accessory'
                icon='delete'
                color={theme.form.colors.destructive}
                size={16}
                onPress={event => onDelete?.(event)}
                style={styles.deleteIcon}
            />
        );
    } else if (renderRightAccessory) {
        rightAccessory = renderRightAccessory({});
    }
    if (rightAccessory) {
        rightAccessory = (
            <View style={styles.rightAccessoryContainer}>{rightAccessory}</View>
        );
    }

    const container = (
        <View style={styles.container}>
            <View style={[styles.content, contentContainerStyle]}>
                {children}
            </View>
            {rightAccessory}
        </View>
    );

    if (onPress) {
        return (
            <TouchableRipple
                {...otherProps}
                onPress={event => {
                    onPress?.(event);
                }}
                rippleColor={rippleColor}
                underlayColor={rippleColor}
                style={mergedStyle}
                disabled={!!disabled}
                theme={theme}
            >
                {container}
            </TouchableRipple>
        );
    } else {
        return (
            <View {...otherProps} style={mergedStyle}>
                {container}
            </View>
        );
    }
};

const styles = StyleSheet.create({
    row: {
        minHeight: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rightAccessoryContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        height: 24,
        width: 24,
    },
    deleteIcon: {
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
    },
    rowPad: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    rowTop: {},
    rowBottom: {},
});

export default Row;
