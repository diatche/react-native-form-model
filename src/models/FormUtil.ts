import moment from 'moment';
import { Duration, Moment } from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SplitDateTime {
    date: Moment;
}

export function splitDateTime(date: Moment): { day: Moment; time: Duration } {
    let day = date.clone().startOf('day');
    return {
        day,
        time: moment.duration(date.diff(day)),
    };
}

export function joinDateTime(day: Moment, time: Duration): Moment {
    return day.clone().add(time);
}

export function mutableDateTime$(
    date: Moment
): {
    day: BehaviorSubject<Moment>;
    time: BehaviorSubject<Duration>;
} {
    let { day, time } = splitDateTime(date);
    return {
        day: new BehaviorSubject(day),
        time: new BehaviorSubject(time),
    };
}

export function joinDateTime$(
    day: Observable<Moment>,
    time: Observable<Duration>
): Observable<Moment> {
    return combineLatest([day, time]).pipe(map(x => joinDateTime(...x)));
}
