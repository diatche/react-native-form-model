import { ButtonProps } from '../../components/Button';
import { MaybeObservable } from '../../util/reactUtil';
import FieldModel, { FieldModelOptions } from './FieldModel';

export interface ButtonFieldModelOptions extends FieldModelOptions {
    title: MaybeObservable<string>;
    mode?: ButtonProps['mode'];
    disabled?: boolean;
    compact?: boolean;
    numberOfLines?: number;
    loading?: MaybeObservable<boolean>;
    onPress: () => any;
}

export default class ButtonFieldModel
    extends FieldModel
    implements ButtonFieldModelOptions
{
    title: MaybeObservable<string>;
    mode: ButtonProps['mode'];
    disabled?: boolean;
    compact: boolean;
    numberOfLines?: number;
    loading?: MaybeObservable<boolean>;
    onPress: () => any;

    constructor(options: ButtonFieldModelOptions) {
        super(options);
        const { mode = 'contained', compact = true } = options;
        this.title = options.title;
        this.mode = mode;
        this.disabled = options.disabled;
        this.compact = compact;
        this.numberOfLines = options.numberOfLines;
        this.loading = options.loading;
        this.onPress = options.onPress;
    }
}
