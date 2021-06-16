import { MaybeObservable } from '../../util/reactUtil';
import FieldModel, { FieldModelOptions } from './FieldModel';

export interface LabelFieldModelOptions extends FieldModelOptions {
    title: MaybeObservable<string>;
    color?: string;
    selectable?: boolean;
}

export default class LabelFieldModel extends FieldModel {
    title: MaybeObservable<string>;
    color?: string;
    selectable: boolean;

    constructor(options: LabelFieldModelOptions) {
        super(options);
        const { selectable = true } = options;
        this.title = options.title;
        this.color = options.color;
        this.selectable = selectable;
    }
}
