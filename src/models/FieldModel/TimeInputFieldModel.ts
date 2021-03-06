import moment, { Duration, Moment } from 'moment';
import { TextInputProps } from 'react-native';
import { Observable, Subscription } from 'rxjs';

import { lz } from '../../util/locale';
import { MaybeObservable } from '../../util/reactUtil';
import { ViewRef } from '../formTypes';
import InputFieldModel, {
    ParsedInputFieldModelOptions,
} from './InputFieldModel';
import { KeyboardInputFieldModelBaseOptions } from './KeyboardInputFieldModel';

export interface TimeInputFieldModelOptions
    extends ParsedInputFieldModelOptions<Duration, Duration>,
        KeyboardInputFieldModelBaseOptions {
    refDay?: MaybeObservable<Moment | undefined>;
    futureDisabled?: boolean;
}

export default class TimeInputFieldModel
    extends InputFieldModel<Duration, Duration>
    implements TimeInputFieldModelOptions
{
    mode: TimeInputFieldModelOptions['mode'] | undefined;
    refDay: MaybeObservable<Moment | undefined> | undefined;
    futureDisabled: boolean;
    autoFocus: boolean;
    optional: boolean;
    returnKeyType: TextInputProps['returnKeyType'];
    clearTextOnFocus: boolean;
    selectTextOnFocus: boolean;
    clearButtonMode: TextInputProps['clearButtonMode'];

    private _refDay?: Moment;
    private _refDaySub?: Subscription;

    constructor(options: TimeInputFieldModelOptions) {
        const {
            parseInput = value => value,
            validation = duration => {
                const refDay = this.getRefDay();
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
        const {
            mode = 'plain',
            autoFocus = false,
            futureDisabled = false,
            optional = false,
            clearTextOnFocus = false,
            selectTextOnFocus = false,
            clearButtonMode = 'never',
        } = options;
        this.mode = mode;
        this.refDay = options.refDay;
        this.futureDisabled = futureDisabled;
        this.autoFocus = autoFocus;
        this.optional = optional;
        this.returnKeyType = options.returnKeyType;
        this.clearTextOnFocus = clearTextOnFocus;
        this.selectTextOnFocus = selectTextOnFocus;
        this.clearButtonMode = clearButtonMode;
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

    onMount(viewRef: ViewRef) {
        super.onMount(viewRef);

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

    onUnmount(viewRef: ViewRef) {
        super.onUnmount(viewRef);
        this._refDaySub?.unsubscribe();
        this._refDaySub = undefined;
    }
}
