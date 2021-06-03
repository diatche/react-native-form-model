import { FlexStyle } from 'react-native';
import { FieldAlignment } from '../models';

export const kAlignmentToJustifyContentMap: {
    [K in FieldAlignment]: FlexStyle['justifyContent'];
} = {
    left: 'flex-start',
    center: 'space-between',
    right: 'flex-end',
};
