import { ViewProps } from 'react-native';

import FieldModel, { FieldModelOptions } from './FieldModel';

export interface CustomFieldModelOptions extends FieldModelOptions {
    render: (props: ViewProps) => React.ReactNode;
}

export default class CustomFieldModel extends FieldModel {
    render: (props: ViewProps) => React.ReactNode;

    constructor(options: CustomFieldModelOptions) {
        super(options);
        this.render = options.render;
    }
}
