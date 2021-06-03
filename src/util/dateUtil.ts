import moment, { Duration } from 'moment';
import { Moment } from 'moment';
import { Observable, Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { safeKeyList } from './util';

export type DateUnit =
    | 'millisecond'
    | 'second'
    | 'minute'
    | 'hour'
    | 'day'
    | 'month'
    | 'year';

export const kDateUnitsAsc = safeKeyList<DateUnit>({
    millisecond: 1,
    second: 1,
    minute: 1,
    hour: 1,
    day: 1,
    month: 1,
    year: 1,
});
export const kDateUnitsDes: typeof kDateUnitsAsc = kDateUnitsAsc
    .slice()
    .reverse();

export const isDateUnit = (unit: any): unit is DateUnit => {
    return kDateUnitsAsc.indexOf(unit as any) >= 0;
};

/**
 * Triggers a callback on every `options.significantUnit` change
 * in the local time zone.
 * @param callback
 * @param options.significantUnit `day` by default.
 * @returns obj.cancel A cancel function
 */
export const significantTimeChanges = (
    options: {
        significantUnit: moment.unitOfTime.Base;
    } = {
        significantUnit: 'day',
    }
): Observable<Moment> => {
    const { significantUnit } = options;
    if (!moment.normalizeUnits(significantUnit)) {
        throw new Error(`Invalid date unit: ${significantUnit}`);
    }

    let periodTimer: any;
    let stream = new Subject<Moment>();

    let waitForNext = () => {
        let now = moment();
        let periodEnd = now
            .clone()
            .startOf(significantUnit)
            .add(1, significantUnit);
        let msLeft = periodEnd.valueOf() - now.valueOf();
        periodTimer = setTimeout(() => {
            periodTimer = 0;
            stream.next(periodEnd);
            waitForNext();
        }, msLeft);
    };
    waitForNext();

    const cleanup = () => {
        periodTimer && clearTimeout(periodTimer);
        periodTimer = 0;
        (waitForNext as any) = undefined;
    };

    return stream.pipe(finalize(() => cleanup()));
};

export const destructureDuration = (
    duration: moment.Duration
): [number, DateUnit] => {
    let dateUnit: DateUnit | undefined;
    let unitValue = 0;
    for (let calUnit of kDateUnitsDes) {
        let value = duration.get(calUnit);
        if (value === 0 || isNaN(value)) {
            continue;
        }
        if (isDateUnit(calUnit)) {
            if (dateUnit) {
                throw new Error(
                    `Durations with multiple units is not supported`
                );
            }
            dateUnit = calUnit;
            unitValue = value;
        } else {
            throw new Error(`Duration unit ${calUnit} is not supported`);
        }
    }
    return [unitValue, dateUnit || 'millisecond'];
};
