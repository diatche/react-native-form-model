import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { SectionModel } from '../models';
import { PaperThemeWithForm } from '../models/FormStyle';
import { useObservableIfNeeded } from '../util/reactUtil';
import Divider from './Divider';
import FormRow from './FormRow';

// TODO: Optimise updates with React.memo().

export interface FormSectionProps extends ViewProps {
    section: SectionModel;
}

const FormSection: React.FC<FormSectionProps> = ({
    section,
    style,
    ...otherProps
}: FormSectionProps) => {
    const theme = useTheme() as PaperThemeWithForm;
    const formStyle = section.resolveStyle(theme.form);
    const maxIndex = section.rows.length - 1;

    const { value: title } = useObservableIfNeeded(section.title);
    let titleView: React.ReactNode = null;
    if (title) {
        if (typeof title === 'string') {
            titleView = (
                <Text
                    style={[
                        styles.defaultTitle,
                        {
                            textAlign: formStyle.sectionTitleAlign,
                            color: formStyle.colors.sectionTitle,
                        },
                    ]}
                >
                    {title}
                </Text>
            );
        } else {
            titleView = title || null;
        }
    }

    const rows = section.rows.map((row, i) => (
        <View key={row.key} style={styles.rowAndDivider}>
            <FormRow row={row} />
            {i < maxIndex ? <Divider style={styles.divider} /> : null}
        </View>
    ));

    const { value: footer } = useObservableIfNeeded(section.footer);
    let footerView: React.ReactNode = null;
    if (footer) {
        if (typeof footer === 'string') {
            footerView = (
                <Text
                    style={[
                        styles.defaultFooter,
                        {
                            textAlign: formStyle.sectionFooterAlign,
                            color: formStyle.colors.sectionFooter,
                        },
                    ]}
                >
                    {footer}
                </Text>
            );
        } else {
            footerView = footer || null;
        }
    }

    return (
        <View {...otherProps} style={[styles.container, style]}>
            {titleView}
            <View
                style={[
                    styles.rowContainer,
                    {
                        backgroundColor: theme.colors.surface,
                        borderRadius: formStyle.roundness,
                    },
                ]}
            >
                {rows}
            </View>
            {footerView}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'stretch',
    },
    defaultTitle: {
        width: '100%',
        fontSize: 16,
        fontWeight: 'bold',
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    rowContainer: {
        flexShrink: 1,
        alignItems: 'stretch',
    },
    rowAndDivider: {
        flexShrink: 1,
        alignItems: 'stretch',
    },
    divider: {
        margin: 0,
        padding: 0,
    },
    defaultFooter: {
        width: '100%',
        fontSize: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
});

export default FormSection;
