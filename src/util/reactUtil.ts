import _ from 'lodash';
import moment, { Duration, Moment } from 'moment';
import React from 'react';
import {
    Animated,
    InteractionManager,
    LayoutChangeEvent,
    Platform,
} from 'react-native';
import {
    BehaviorSubject,
    MonoTypeOperatorFunction,
    Observable,
    Subject,
    bindCallback,
} from 'rxjs';
import {
    combineLatest,
    distinctUntilChanged,
    finalize,
    map,
    skip,
    take,
} from 'rxjs/operators';

import {
    DateUnit,
    destructureDuration,
    significantTimeChanges,
} from './dateUtil';

export interface StreamSubscription {
    off?: () => void;
}

export type StreamCallback<T> = (item: T) => void;

export interface Stream<T, Opt> extends Partial<StreamSubscription> {
    on: (
        cb: StreamCallback<T>,
        options?: Opt
    ) => StreamSubscription | undefined;
}

export interface StreamOptions<T> {
    filter?: (item: T) => boolean;
    keyExtractor?: (item: T) => string | number;
    sort?: (item: T) => string | number;
    deps?: React.DependencyList;
    throttle?: number;
    onOpen?: (sub: StreamSubscription | undefined) => void;
    onClose?: (sub: StreamSubscription | undefined) => void;
}

export interface ILayout {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Returns the component layout.
 *
 * Usage:
 * ```
 *  const Component = () => {
 *      const [layout, onLayout] = useLayout();
 *      return <View onLayout={onLayout} />;
 *  };
 * ```
 *
 * Source: https://stackoverflow.com/a/57792001/328356
 */
export const useLayout = (options?: {
    filter?: (layout: ILayout & { previous?: ILayout }) => boolean;
    dedupe?: boolean;
    updateOnChange?: boolean;
}): [ILayout | undefined, (event: LayoutChangeEvent) => void] => {
    let layoutState: any;
    const layoutRef = React.useRef<ILayout | undefined>();
    if (options?.updateOnChange) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        layoutState = React.useState<ILayout | undefined>();
    }

    const onLayout = React.useCallback((event: LayoutChangeEvent) => {
        const newLayout = event.nativeEvent.layout;
        const layoutWithPrevious = {
            ...newLayout,
            previous: layoutRef.current,
        };
        if (options?.dedupe && _.isEqual(layoutRef.current, newLayout)) {
            return;
        }
        if (!options?.filter || options.filter(layoutWithPrevious)) {
            layoutRef.current = newLayout;
            layoutState?.[1](newLayout);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return [layoutRef.current, onLayout];
};

export function usePrevious<T>(value: T) {
    const ref = React.useRef(value);
    React.useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

export function latestAfterInteractions<T>(): MonoTypeOperatorFunction<T> {
    return input$ =>
        input$.pipe(
            combineLatest(onInteractionsEnd()),
            map(x => x[0])
        );
    // return input$ => onInteractionsEnd().pipe(flatMap(() => input$));
}

export const onInteractionsEnd = (): Observable<void> => {
    return bindCallback(InteractionManager.runAfterInteractions)();
};

export function animatedObservable(value: Animated.Value): Observable<number> {
    // TODO: Only add listener after subscription. See [task](https://trello.com/c/zt7mL5Nh)
    let subject: Subject<number>;
    // @ts-ignore: _value is private
    if (typeof value._value !== 'undefined') {
        // @ts-ignore: _value is private
        subject = new BehaviorSubject<number>(value._value);
    } else {
        subject = new Subject<number>();
    }
    const animatedSub = value.addListener(({ value }) => {
        subject.next(value);
    });
    return subject.pipe(
        finalize(() => {
            value.removeListener(animatedSub);
        })
    );
}

export interface UsePromiseResult<T> {
    value?: T;
    error?: Error;
    loading: boolean;
    complete: boolean;
}

export function usePromise<T>(
    promise?: T | Promise<T> | (() => Promise<T> | T | undefined),
    dependencies: any[] = [],
    options?: { onComplete?: (result: UsePromiseResult<T>) => void }
): UsePromiseResult<T> {
    const [_promise, setPromise] = React.useState(promise);
    const [res, setRes] = React.useState<UsePromiseResult<T>>({
        loading: !!_promise,
        complete: false,
    });

    const setResAndCallback = (result: UsePromiseResult<T>) => {
        setRes(result);
        if (result.complete) {
            options?.onComplete?.({ ...result });
        }
    };

    if (typeof promise !== 'function') {
        if (promise !== _promise) {
            setPromise(promise);
            if (promise instanceof Promise) {
                setResAndCallback({ loading: !!promise, complete: false });
            } else {
                setResAndCallback({
                    value: promise,
                    loading: false,
                    complete: true,
                });
            }
        }
    }
    React.useEffect(() => {
        let active = true;
        if (_promise && _promise instanceof Promise) {
            (_promise as Promise<T>)
                ?.then(
                    value =>
                        active &&
                        setResAndCallback({
                            value,
                            loading: false,
                            complete: true,
                        })
                )
                .catch(
                    error =>
                        active &&
                        setResAndCallback({
                            error,
                            loading: false,
                            complete: true,
                        })
                );
        }
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_promise, ...dependencies]);
    return res;
}

export function useImport<T>(
    importPromise: Promise<T> | (() => Promise<T> | undefined),
    options?: { onComplete?: (result: UsePromiseResult<T>) => void }
): Partial<T> {
    const m = usePromise(importPromise, [], options);
    return m.value || {};
}

export interface UseObservableResult<T> {
    value?: T;
    error?: Error;
    complete: boolean;
}

export function useObservable<T>(
    observable?: Observable<T> | (() => Observable<T> | undefined),
    dependencies: any[] = [],
    options?: {
        onChange?: (value: T) => void;
        onUnmount?: () => any;
    }
): UseObservableResult<T> {
    const [_observable] = React.useState(observable);

    const [state, setState] = React.useState<UseObservableResult<T>>(() => {
        let defaultValue: T | undefined = undefined;

        if (_observable instanceof BehaviorSubject) {
            defaultValue = _observable.value;
        } else {
            // Check for immediate value
            const sub = _observable?.pipe(take(1)).subscribe(value => {
                defaultValue = value;
            });
            sub?.unsubscribe();
        }

        return {
            value: defaultValue,
            complete: false,
        };
    });

    // TODO: use rx dispatch to avoid extra setState with BehaviorSubject and immediate values
    React.useEffect(() => {
        const sub = _observable?.pipe(distinctUntilChanged()).subscribe({
            next: value => {
                setState({ value, complete: false });
                options?.onChange?.(value);
            },
            error: error => setState({ error, complete: true }),
            complete: () => setState(state => ({ ...state, complete: true })),
        });
        return () => {
            sub?.unsubscribe();
            options?.onUnmount?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_observable, ...dependencies]);

    return state;
}

export function useBehaviorSubject<T>(
    subject: BehaviorSubject<T> | (() => BehaviorSubject<T>),
    dependencies: any[] = [],
    options?: {
        onChange?: (value: T) => void;
        onUnmount?: () => any;
    }
): T {
    const [_subject] = React.useState(subject);
    const [value, setValue] = React.useState(_subject.value);

    React.useEffect(() => {
        const sub = _subject
            ?.pipe(distinctUntilChanged(), skip(1))
            .subscribe(value => {
                setValue(value);
                options?.onChange?.(value);
            });
        return () => {
            sub?.unsubscribe();
            options?.onUnmount?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_subject, ...dependencies]);

    return value;
}

export type MaybeObservable<T> = Observable<T> | T;
export type ExctactMaybeObservableType<T> = T extends Observable<infer U>
    ? U
    : T;

export function useObservableIfNeeded<T>(
    maybeObservable?:
        | MaybeObservable<T>
        | (() => MaybeObservable<T> | undefined),
    dependencies?: any[]
): UseObservableResult<T> {
    const [_maybeObservable] = React.useState(maybeObservable);
    const observableResult = useObservable(
        () =>
            _maybeObservable instanceof Observable
                ? _maybeObservable
                : new BehaviorSubject<T>(undefined as any),
        dependencies
    );
    if (_maybeObservable instanceof Observable) {
        return observableResult;
    }
    return {
        value: _maybeObservable,
        complete: true,
    };
}

/**
 * Creates a behavior subject, which tracks the
 * specified `value`.
 *
 * @param value
 * @param options
 * @returns
 */
export function useValueAsBehaviorSubject<T>(
    value: T,
    options?: { serializer?: (value: T) => any }
): BehaviorSubject<T> {
    const subject = React.useRef(new BehaviorSubject(value)).current;
    React.useEffect(() => {
        subject.next(value);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options?.serializer ? options.serializer(value) : value]);
    React.useEffect(() => {
        return () => {
            subject.complete();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return subject;
}

/**
 * Returns the date interval between now
 * and the specifed `duration` ago.
 *
 * The end of the current period is used as
 * the first value.
 *
 * Use only with durations composed of only
 * one date unit.
 *
 * Updates on significant time changes
 * automatically.
 *
 * @param duration
 */
export function useCurrentDateInterval(duration: Duration): {
    startDate: Moment;
    endDate: Moment;
} {
    const stateRef = React.useRef<{
        duration?: Duration;
        timeValue?: number;
        timeUnit?: DateUnit;
        initDate?: Moment;
    }>({});
    if (
        duration.asMilliseconds() !==
        stateRef.current.duration?.asMilliseconds()
    ) {
        // We must fix the current date to stop infinite loop on start.
        const [timeValue, timeUnit] = destructureDuration(duration);
        stateRef.current = {
            duration,
            timeValue,
            timeUnit,
            initDate: moment().startOf(timeUnit).add(1, timeUnit),
        };
    }

    const { value: date = stateRef.current.initDate! } = useObservable(() => {
        return significantTimeChanges({
            significantUnit: stateRef.current.timeUnit!,
        });
    }, [stateRef.current]);

    return {
        startDate: date.clone().subtract(duration),
        endDate: date.clone(),
    };
}

/**
 * Prevents body scroll on web in this component.
 * Has no effect on other platforms.
 *
 * Credit: https://usehooks.com/useLockBodyScroll/
 */
export function useLockBodyScroll() {
    if (Platform.OS !== 'web') {
        return;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useLayoutEffect(() => {
        // Get original body overflow
        const originalStyle = window.getComputedStyle(document.body).overflow;
        // Prevent scrolling on mount
        document.body.style.overflow = 'hidden';
        // Re-enable scrolling when component unmounts
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []); // Empty array ensures effect is only run on mount and unmount
}
