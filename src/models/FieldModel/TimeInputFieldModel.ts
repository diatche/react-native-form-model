import { lz } from '../../util/locale';
import moment, { Duration, Moment } from 'moment';
import { Observable, Subscription } from 'rxjs';
import { MaybeObservable } from '../../util/reactUtil';
import InputFieldModel, {
    ParsedInputFieldModelOptions,
} from './InputFieldModel';

export interface TimeInputFieldModelOptions
    extends ParsedInputFieldModelOptions<Duration, Duration> {
    refDay?: MaybeObservable<Moment | undefined>;
    futureDisabled?: boolean;
    autoFocus?: boolean;
    optional?: boolean;
}

export default class TimeInputFieldModel extends InputFieldModel<
    Duration,
    Duration
> {
    refDay: MaybeObservable<Moment | undefined> | undefined;
    futureDisabled: boolean;
    autoFocus: boolean;
    optional: boolean;

    private _refDay?: Moment;
    private _refDaySub?: Subscription;

    constructor(options: TimeInputFieldModelOptions) {
        let {
            parseInput = value => value,
            validation = duration => {
                let refDay = this.getRefDay();
                if (duration && !refDay) {
                    return lz('missingDate');
                }
                if (!duration || !refDay) {
                    return this.optional || lz('invalidTime');
                }
                return (
                    !this.futureDisabled ||
                    refDay.add(duration).isSameOrBefore(moment()) ||
                    lz('dateMustBeInPast')
                );
            },
        } = options;
        super({
            formatValue: time => this.formatTime(time),
            ...options,
            parseInput,
            validation,
        });
        let {
            autoFocus = false,
            futureDisabled = false,
            optional = false,
        } = options;
        this.refDay = options.refDay;
        this.futureDisabled = futureDisabled;
        this.autoFocus = autoFocus;
        this.optional = optional;
    }

    getRefDay() {
        return this._refDay?.clone().startOf('day');
    }

    formatDate(date?: Moment): string {
        if (!date) {
            return '';
        }
        return date.format('LT');
    }

    formatTime(time?: Duration): string {
        if (!time) {
            return '';
        }
        return moment().startOf('day').add(time).format('LT');
    }

    onMount() {
        super.onMount();

        this._refDaySub = undefined;
        this._refDay = undefined;

        if (this.refDay && this.refDay instanceof Observable) {
            this._refDaySub = this.refDay.subscribe(value => {
                this._refDay = value;
                this.validate();
            });
        } else {
            this._refDay = this.refDay;
        }
        this.validate();
    }

    onUnmount() {
        super.onUnmount();
        this._refDaySub?.unsubscribe();
        this._refDaySub = undefined;
    }
}
