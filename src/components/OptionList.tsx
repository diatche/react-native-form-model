import _ from 'lodash';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import FormModel from '../models/FormModel';
import { PaperThemeWithForm } from '../models/FormStyle';
import {
    useBehaviorSubject,
    usePrevious,
    useValueAsBehaviorSubject,
} from '../util';
import Form, { FormProps } from './Form';
import FormAssets from './FormAssets';

export interface OptionListProps<T = any> extends Omit<FormProps, 'form'> {
    title?: string;
    items: T[];
    selectedIndex?: number;
    onSelect?: (item: T, index: number) => void;
    formatItem?: (item: T, index: number) => string;
    /**
     * Text color of the items.
     */
    itemColor?: string;
    /**
     * Color of the item checkmark.
     */
    chechmarkColor?: string;
}

export default function OptionList<T = any>({
    title,
    items,
    selectedIndex,
    onSelect,
    formatItem = String,
    itemColor,
    chechmarkColor,
    style,
    ...props
}: OptionListProps<T>) {
    const theme = useTheme() as PaperThemeWithForm;
    chechmarkColor = chechmarkColor || theme.form.colors.input;

    // Avoid comparing arrays
    const dataIdRef = React.useRef(0);
    const previousItems = usePrevious(items);
    React.useEffect(() => {
        if (!_.isEqual(items, previousItems)) {
            dataIdRef.current += 1;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    // Deep forward selected index
    const selectedIndex$ = useValueAsBehaviorSubject(selectedIndex);

    const form = React.useMemo(() => {
        const form = new FormModel();
        const section = form.addSection({
            title,
            style: { colors: { label: itemColor } },
        });
        if (!FormAssets.shared.CheckmarkIcon) {
            console.warn('Missing FormAssets.shared.CheckmarkIcon');
        }
        items.forEach((item, index) => {
            section
                .addRow({
                    onPress: onSelect ? () => onSelect(item, index) : undefined,
                })
                .addLabel({
                    title: formatItem(item, index),
                    flex: 1,
                    selectable: false,
                })
                .addCustom(() =>
                    FormAssets.shared.CheckmarkIcon &&
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    index === useBehaviorSubject(selectedIndex$) ? (
                        <FormAssets.shared.CheckmarkIcon
                            size={24}
                            color={chechmarkColor}
                            style={styles.icon}
                        />
                    ) : (
                        <View style={styles.icon} />
                    )
                );
        });
        return form;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        dataIdRef.current,
        theme,
        chechmarkColor,
        formatItem,
        itemColor,
        items,
        onSelect,
        selectedIndex$,
        title,
    ]);

    return (
        <Form
            {...props}
            form={form}
            style={[
                {
                    backgroundColor:
                        theme.form.colors.formBackground ||
                        theme.colors.background,
                },
                style,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    icon: {
        width: 24,
    },
});
