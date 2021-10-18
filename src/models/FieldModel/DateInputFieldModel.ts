import moment, { Moment } from 'moment';

import { lz } from '../../util/locale';
import InputFieldModel, {
    ParsedInputFieldModelOptions,
} from './InputFieldModel';

export interface DateInputFieldModelOptions
    extends ParsedInputFieldModelOptions<Moment, Moment> {
    futureDisabled?: boolean;
    optional?: boolean;
}

export default class DateInputFieldModel extends InputFieldModel<
    Moment,
    Moment
> {
    futureDisabled: boolean;
    optional: boolean;

    constructor(options: DateInputFieldModelOptions) {
        const {
            parseInput = value => value,
            validation = date => {
                if (!date) {
                    return this.optional;
                }
                return (
                    !this.futureDisabled ||
                    date.isSameOrBefore(moment()) ||
                    lz('dateMustBeInPast')
                );
            },
        } = options;
        super({
            formatValue: date => this.formatDate(date),
            ...options,
            parseInput,
            validation,
        });
        const { futureDisabled = false, optional = false } = options;
        this.futureDisabled = futureDisabled;
        this.optional = optional;
    }

    formatDate(date?: Moment): string {
        if (!date) {
            return '';
        }
        return date.format('L');
    }
}
