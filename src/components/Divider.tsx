import React from 'react';
import { ViewProps } from 'react-native';
import { Divider as PaperDivider, useTheme } from 'react-native-paper';
import { PaperThemeWithForm } from '../models/FormStyle';

export interface DividerProps extends ViewProps {
    inset?: boolean;
}

const Divider = React.memo(({ style, ...props }: DividerProps) => {
    const theme = useTheme() as PaperThemeWithForm;
    return (
        <PaperDivider
            {...props}
            style={[{ backgroundColor: theme.form.colors.divider }, style]}
        />
    );
});

export default Divider;
