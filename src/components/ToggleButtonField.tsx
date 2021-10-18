import _ from 'lodash';
import React from 'react';
import { ToggleButton } from 'react-native-paper';

import ControlField, {
    ControlFieldProps,
    ControlFieldState,
} from './ControlField';

export interface ToggleButtonFieldProps<T>
    extends ControlFieldProps<T, string> {
    values: { [key: string]: T } | T[];
    icons?: { [key: string]: string } | T[];
    accessibilityLabels?: { [key: string]: string } | string[];
}
export interface ToggleButtonFieldState<T>
    extends ControlFieldState<T, string> {}

/** @deprecated */
export default class ToggleButtonField<T = string> extends ControlField<
    T,
    string,
    ToggleButtonFieldProps<T>,
    ToggleButtonFieldState<T>
> {
    renderControl() {
        const {
            values,
            icons = {},
            accessibilityLabels = {},
            theme,
        } = this.props;

        const { userInput } = this.state;

        const keys = _.isArray(values)
            ? values.map(String)
            : Object.keys(values);
        const valuesTable = _.isArray(values)
            ? _.zipObject(keys, values)
            : values;
        const iconsTable = _.isArray(icons) ? _.zipObject(keys, icons) : icons;
        const accessibilityLabelTable = _.isArray(accessibilityLabels)
            ? _.zipObject(keys, accessibilityLabels)
            : accessibilityLabels;
        const firstKey = keys[0];
        const lastKey = keys[keys.length - 1];

        return (
            <ToggleButton.Row
                value={userInput}
                onValueChange={userInput => this.handleUserInput({ userInput })}
            >
                {keys.map(key => {
                    let style = {};
                    if (key === firstKey) {
                        style = {
                            borderTopLeftRadius: theme.roundness,
                            borderBottomLeftRadius: theme.roundness,
                        };
                    } else if (key === lastKey) {
                        style = {
                            borderTopRightRadius: theme.roundness,
                            borderBottomRightRadius: theme.roundness,
                        };
                    }
                    return (
                        <ToggleButton
                            key={key}
                            icon={iconsTable[key]}
                            value={String(valuesTable[key])}
                            accessibilityLabel={accessibilityLabelTable[key]}
                            style={style}
                        />
                    );
                })}
            </ToggleButton.Row>
        );
    }
}
