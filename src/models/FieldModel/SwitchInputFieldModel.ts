import InputFieldModel, {
    ParsedInputFieldModelOptions,
} from './InputFieldModel';

export interface SwitchInputFieldModelOptions
    extends ParsedInputFieldModelOptions<boolean, boolean> {}

export default class SwitchInputFieldModel extends InputFieldModel<
    boolean,
    boolean
> {
    constructor(options: SwitchInputFieldModelOptions) {
        let { parseInput = value => !!value } = options;
        super({
            ...options,
            parseInput,
        });
    }
}
