import InputFieldModel, {
    ParsedInputFieldModelOptions,
} from './InputFieldModel';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type OptionInputFieldType = 'segmentedControl' | 'picker';
export type OptionInputClearButtonMode = 'auto' | 'always' | 'never';

export interface OptionInputFieldModelOptions<T>
    extends ParsedInputFieldModelOptions<T, number> {
    type: OptionInputFieldType;
    possibleValues: T[];
    optional?: boolean;
    clearButtonMode?: OptionInputClearButtonMode;
}

export default class OptionInputFieldModel<T = string> extends InputFieldModel<
    T,
    number
> {
    type: OptionInputFieldType;
    possibleValues: T[];
    optional: boolean;
    clearButtonMode: OptionInputClearButtonMode;

    constructor(options: OptionInputFieldModelOptions<T>) {
        let { parseInput = i => this.possibleValues[i] } = options;
        super({
            ...options,
            parseInput,
        });
        let { optional = false, clearButtonMode = 'auto' } = options;
        this.type = options.type;
        this.possibleValues = [...options.possibleValues];
        this.optional = optional;
        this.clearButtonMode = clearButtonMode;
    }

    selectedIndex(): Observable<number> {
        return this.value.pipe(
            map(value => this.possibleValues.indexOf(value))
        );
    }

    selectIndex(index: number) {
        this.setInput(index);
    }
}
