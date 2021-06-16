import InputFieldModel, {
    ParsedInputFieldModelOptions,
} from './InputFieldModel';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type OptionInputFieldMode = 'segmented' | 'dropdown' | 'dialog';
export type OptionInputClearButtonMode = 'auto' | 'always' | 'never';

export interface OptionInputFieldModelOptions<T>
    extends ParsedInputFieldModelOptions<T, number> {
    mode: OptionInputFieldMode;
    possibleValues: T[];

    /**
     * Set this when values are not
     * supported by `Array#indexOf` method.
     */
    serializer?: (value: T | undefined) => any;

    optional?: boolean;
    prompt?: string;

    /**
     * When to show the clear button.
     *
     * Supported with `segmented` mode only.
     */
    clearButtonMode?: OptionInputClearButtonMode;
}

export default class OptionInputFieldModel<T = string>
    extends InputFieldModel<T, number>
    implements OptionInputFieldModelOptions<T>
{
    mode: OptionInputFieldMode;
    possibleValues: T[];
    serializer?: OptionInputFieldModelOptions<T>['serializer'];
    optional: boolean;
    prompt?: string;
    clearButtonMode: OptionInputClearButtonMode;

    constructor(options: OptionInputFieldModelOptions<T>) {
        let { parseInput = i => this.possibleValues[i] } = options;
        super({
            ...options,
            parseInput,
        });
        let { optional = false, clearButtonMode = 'auto' } = options;
        this.mode = options.mode;
        this.possibleValues = [...options.possibleValues];
        this.serializer = options.serializer;
        this.optional = optional;
        this.prompt = options.prompt;
        this.clearButtonMode = clearButtonMode;
    }

    indexOf(value: T): number {
        if (this.serializer) {
            return this.possibleValues
                .map(this.serializer)
                .indexOf(this.serializer(value));
        }
        return this.possibleValues.indexOf(value);
    }

    selectedIndex(): Observable<number> {
        return this.value.pipe(map(value => this.indexOf(value)));
    }

    selectIndex(index: number) {
        this.setInput(index);
    }
}
