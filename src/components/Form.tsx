import _ from 'lodash';
import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import FormModel from '../models';
import FormSection from './FormSection';

// TODO: Optimise updates with React.memo().

export interface FormProps extends ViewProps {
    form: FormModel;
}

const Form: React.FC<FormProps> = ({
    form,
    style,
    ...otherProps
}: FormProps) => {
    const sectionCount = form.sections.length;
    let sections = form.sections.map((section, i) => {
        let sectionStyle = styles.section;
        if (i !== 0 && sectionCount !== 0) {
            sectionStyle = [
                sectionStyle,
                { marginTop: section.resolveStyleValue('sectionMargin') },
            ];
        }
        return (
            <FormSection
                key={section.key}
                section={section}
                style={sectionStyle}
            />
        );
    });
    if (Platform.OS === 'web') {
        (otherProps as any).accessibilityRole = 'form';
    }
    return (
        <View {...otherProps} style={[styles.container, style]}>
            {sections}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'stretch',
    },
    section: {},
});

export default Form;
