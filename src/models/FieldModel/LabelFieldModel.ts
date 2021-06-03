import { MaybeObservable } from '../../util/reactUtil';
import FieldModel, { FieldModelOptions } from './FieldModel';

export interface LabelFieldModelOptions extends FieldModelOptions {
    title: MaybeObservable<string>;
    color?: string;
}

export default class LabelFieldModel extends FieldModel {
    title: MaybeObservable<string>;
    color?: string;

    constructor(options: LabelFieldModelOptions) {
        super(options);
        this.title = options.title;
        this.color = options.color;
    }
}
