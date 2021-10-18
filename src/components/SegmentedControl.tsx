import React from 'react';
import {
    StyleProp,
    StyleSheet,
    TextStyle,
    View,
    ViewProps,
    ViewStyle,
} from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { PaperThemeWithForm } from '../models/FormStyle';
import ClearButton from './ClearButton';

const kItemMargin = 6;

export interface SegmentedControlProps extends ViewProps {
    selectedIndex?: number;
    possibleValues: string[];
    optional?: boolean;
    clearButtonMode?: 'auto' | 'always' | 'never';
    disabled?: boolean;
    color?: string;
    disabledColor?: string;
    onSelect: (index: number) => any;
    textStyle?: StyleProp<TextStyle>;
    itemStyle?: StyleProp<ViewStyle>;
}

const SegmentedControl = React.memo(
    ({
        selectedIndex: selectedIndexProp,
        possibleValues,
        optional = false,
        clearButtonMode = 'auto',
        disabled = false,
        onSelect,
        textStyle: textStyleProp,
        itemStyle: itemStyleProp,
        style,
        ...otherProps
    }: SegmentedControlProps) => {
        const theme = useTheme() as PaperThemeWithForm;
        const {
            color = theme.form.colors.buttonBackground,
            disabledColor = theme.form.colors.disabled,
        } = otherProps;
        const selectedColor = disabled ? disabledColor : color;
        const itemStyle: StyleProp<ViewStyle> = [
            itemStyleProp,
            {
                borderRadius: theme.roundness,
            },
        ];
        const textStyle: StyleProp<TextStyle> = [
            textStyleProp,
            {
                color: selectedColor,
            },
        ];
        const selectedItemStyle: ViewStyle = {
            backgroundColor: selectedColor,
            borderRadius: theme.roundness,
        };
        let rippleColor = selectedItemStyle.backgroundColor
            ? String(selectedItemStyle.backgroundColor)
            : undefined;
        if (rippleColor) {
            rippleColor += '60';
        }
        const selectedTextStyle: StyleProp<TextStyle> = [
            textStyleProp,
            {
                color: theme.form.colors.buttonForeground,
            },
        ];
        const showClearButton =
            !disabled &&
            (clearButtonMode === 'always' ||
                (clearButtonMode === 'auto' && optional));

        const [selectedIndex, setSelectedIndex] = React.useState(() => {
            if (
                !optional &&
                (typeof selectedIndexProp === 'undefined' ||
                    selectedIndexProp < 0)
            ) {
                throw new Error(
                    'Must supply selectedIndex or set optional to true on SegmentedControl'
                );
            }
            return selectedIndexProp;
        });

        const handleSelect = (index: number) => {
            setSelectedIndex(index);
            onSelect?.(index);
        };

        const items = possibleValues.map((value, i, items) => {
            const itemCount = items.length;
            const isSelected = i === selectedIndex;
            return (
                <TouchableRipple
                    key={i}
                    disabled={disabled}
                    style={[
                        styles.ripple,
                        styles.item,
                        isSelected ? selectedItemStyle : itemStyle,
                        i !== 0 && itemCount > 1
                            ? { marginLeft: kItemMargin }
                            : {},
                        { borderRadius: theme.roundness },
                    ]}
                    rippleColor={rippleColor}
                    underlayColor={rippleColor}
                    onPress={() => handleSelect(i)}
                >
                    <Text
                        selectable={false}
                        adjustsFontSizeToFit
                        minimumFontScale={0.6}
                        numberOfLines={1}
                        style={[
                            styles.itemText,
                            isSelected ? selectedTextStyle : textStyle,
                        ]}
                    >
                        {String(value)}
                    </Text>
                </TouchableRipple>
            );
        });
        return (
            <View {...otherProps} style={[styles.container, style]}>
                {items}
                {showClearButton && (
                    <ClearButton
                        disabled={disabled}
                        style={{ marginLeft: kItemMargin }}
                        onPress={() => handleSelect(-1)}
                    />
                )}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    item: {
        flexShrink: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    ripple: {
        overflow: 'hidden',
    },
    itemText: {
        flexShrink: 1,
        textAlign: 'center',
    },
});

export default SegmentedControl;
