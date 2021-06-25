import React from 'react';
import {
    StyleProp,
    StyleSheet,
    View,
    ViewProps,
    ViewStyle,
} from 'react-native';
import { TouchableRipple, useTheme } from 'react-native-paper';
import { PaperThemeWithForm } from '../models/FormStyle';
import { useObservable } from '../util/reactUtil';
import { LineBreakFieldModel, RowModel } from '../models';
import FormField from './FormField';

// TODO: Optimise updates with React.memo().

export interface FormRowProps extends ViewProps {
    row: RowModel;
}

const FormRow: React.FC<FormRowProps> = ({
    row,
    style: outerStyle,
    ...otherProps
}: FormRowProps) => {
    const theme = useTheme() as PaperThemeWithForm;
    let lineInfos: { fields: React.ReactNode[]; style?: ViewStyle }[] = [
        { fields: [] },
    ];
    let lineIndex = 0;
    const { value: visibleFields = [] } = useObservable(
        () => row.visibleFields$(),
        [row]
    );
    for (let field of visibleFields) {
        if (field instanceof LineBreakFieldModel) {
            let lineStyle: ViewStyle = {};
            if (field.lineHeight) {
                lineStyle.minHeight = field.lineHeight;
            }
            if (field.marginTop) {
                lineStyle.marginTop = field.marginTop;
            }
            if (field.marginBottom) {
                lineStyle.marginBottom = field.marginBottom;
            }
            if (field.modifyLine) {
                lineInfos[lineIndex].style = {
                    ...lineInfos[lineIndex].style,
                    ...lineStyle,
                };
            } else {
                lineInfos.push({ fields: [], style: lineStyle });
                lineIndex += 1;
            }
            continue;
        }
        lineInfos[lineIndex].fields.push(
            <FormField key={field.key} field={field} style={styles.field} />
        );
    }
    let lineViews = lineInfos.map((lineInfo, i) => {
        let lineStyle: StyleProp<ViewStyle> = styles.line;
        if (lineInfo.style) {
            lineStyle = [lineStyle, lineInfo.style];
        }
        return (
            <View key={i} style={lineStyle}>
                {lineInfo.fields}
            </View>
        );
    });

    const height = row.resolveStyleValue('rowHeight', theme.form);
    let style: ViewStyle = {};
    if (typeof height !== 'undefined') {
        style = { minHeight: height };
    }
    let compoundStyle = [styles.container, style, outerStyle];
    if (row.onPress) {
        const colors = row.resolveStyleValue('colors', theme.form);
        const roundness = row.resolveStyleValue('roundness', theme.form);

        let rippleColor = colors.input;
        if (rippleColor) {
            rippleColor += '60';
        }

        if (row.isFirstRow()) {
            compoundStyle.push({
                borderTopLeftRadius: roundness,
                borderTopRightRadius: roundness,
            });
        }
        if (row.isLastRow()) {
            compoundStyle.push({
                borderBottomLeftRadius: roundness,
                borderBottomRightRadius: roundness,
            });
        }

        return (
            <TouchableRipple
                {...otherProps}
                onPress={event => row.onPress?.(row, event)}
                rippleColor={rippleColor}
                underlayColor={rippleColor}
                style={compoundStyle}
            >
                <View style={[styles.container, styles.flex]}>{lineViews}</View>
            </TouchableRipple>
        );
    } else {
        return (
            <View {...otherProps} style={compoundStyle}>
                {lineViews}
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    line: {
        flexGrow: 1,
        flexShrink: 1,
        alignItems: 'stretch',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    field: {
        flexShrink: 1,
    },
    flex: { flex: 1 },
});

export default FormRow;
