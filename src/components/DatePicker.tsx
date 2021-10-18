import moment, { Moment } from 'moment';
import React, { Component } from 'react';
import { Platform, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Modal, Portal, Surface, withTheme } from 'react-native-paper';
import semverCompare from 'semver-compare';

import { PaperThemeWithForm } from '../models/FormStyle';
import { getCurrentLocale, lz } from '../util/locale';
import Button from './Button';
import FormAssets from './FormAssets';

const locale = getCurrentLocale();

// TODO: iOS 14 date picker ignores textColor, so it is not usable in dark mode. See [issue](https://trello.com/c/L5uiBiTw)
const iOSDisplay: 'spinner' | 'default' | 'inline' = 'spinner';

/**
 * Default picker behaviour was changed in iOS 14.
 *
 * In iOS 14, the picker is both the field, which
 * automatically manages the picker modal.
 *
 * Prior to iOS 14, the picker view was separate
 * from the picker field and was managed separately.
 */
const isIOS14Like =
    Platform.OS === 'ios' &&
    iOSDisplay !== 'spinner' &&
    semverCompare(Platform.constants.osVersion, '14.0') >= 0;

type Align = 'left' | 'center' | 'right';

LocaleConfig.locales[locale] = {
    monthNames: moment.months(),
    monthNamesShort: moment.monthsShort(),
    dayNames: moment.weekdays(),
    dayNamesShort: moment.weekdaysShort(),
    today: lz('today'),
};
LocaleConfig.defaultLocale = locale;

export type DatePickerMode = 'date' | 'time';

export interface DatePickerProps extends ViewProps {
    value?: Moment;
    disabled?: boolean;
    submitOnChange?: boolean;
    onChange?: (value: Moment) => void;

    /**
     * Set the picker visible value to false here.
     *
     * On Android, you must set visible property to false before
     * changing the value property, or else the picker will
     * reapper a second time. See
     * [issue](https://github.com/react-native-datetimepicker/datetimepicker/issues/54).
     */
    onSubmit: (value: Moment) => void;

    /**
     * Set the picker visible value to false here.
     */
    onCancel: () => void;
    visible: boolean;
    futureDisabled?: boolean;
    theme: PaperThemeWithForm;
    mode: DatePickerMode;
    align?: Align;
}

interface DatePickerState {
    date: Moment;
}

// Choose internal date picker
let NativeDatePicker: typeof Component;
switch (Platform.OS) {
    case 'ios':
    case 'android': {
        NativeDatePicker =
            require('@react-native-community/datetimepicker').default;
        break;
    }
    default: {
        console.warn('No native date picker, using calendar.');
        break;
    }
}

/** Cross-platform date picker wrapper. */
class DatePicker extends Component<DatePickerProps, DatePickerState> {
    static readonly submitOnChangeSupported =
        Platform.OS === 'web' || isIOS14Like;

    static readonly isTimePickerSupported = (() => {
        switch (Platform.OS) {
            case 'ios':
            case 'android':
                return true;
            default: {
                return false;
            }
        }
    })();

    /**
     * Whether the modal is managed automatically and
     * the view should be displayed as a field.
     */
    static isIntegrated(options: { mode: DatePickerMode }) {
        return isIOS14Like;
    }

    constructor(props: DatePickerProps) {
        super(props);
        this.state = {
            date: this.cleanDate(props.value || moment()),
        };
    }

    componentDidMount() {
        if (!FormAssets.shared.LeftArrowIcon) {
            console.warn('Missing FormAssets.shared.LeftArrowIcon');
        }
        if (!FormAssets.shared.RightArrowIcon) {
            console.warn('Missing FormAssets.shared.RightArrowIcon');
        }
    }

    getSnapshotBeforeUpdate(): Partial<DatePickerProps> {
        return { visible: this.props.visible };
    }

    componentDidUpdate(prevProps: Partial<DatePickerProps>) {
        // Set selected date value to specified date value
        // when becoming visible.
        if (this.props.visible && !prevProps.visible) {
            this._setDate(this.cleanDate(this.props.value || moment()), {
                willShow: true,
            });
        }
    }

    private _setDate(date: Moment, options?: { willShow?: boolean }) {
        if (Platform.OS === 'android' && !options?.willShow) {
            // Modal handles state. Changing the date before hiding the modal
            // makes the modal reappear a second time after being dismissed. See issue:
            // https://github.com/react-native-datetimepicker/datetimepicker/issues/54
            return;
        }
        this.setState({ date });
    }

    onChange(value: any): Partial<DatePickerState> {
        const cleanDate = this.cleanDate(value);
        const newState = { date: cleanDate };
        this._setDate(newState.date);
        this.props.onChange && this.props.onChange(cleanDate);

        if (DatePicker.submitOnChangeSupported && this.props.submitOnChange) {
            this.onSubmit(newState);
        }

        return newState;
    }

    onSubmit(newState?: DatePickerState) {
        const date = (newState && newState.date) || this.state.date;
        this.props.onSubmit(date);
    }

    onCancel() {
        this.props.onCancel();
    }

    handleAndroidModalEvent(event: any, date: Date) {
        event = {
            type: 'dismissed',
            nativeEvent: {},
            ...(event || {}),
        };
        switch (event.type) {
            case 'set': {
                const newState: DatePickerState = {
                    ...this.state,
                    ...this.onChange(moment(date)),
                };
                this.onSubmit(newState);
                break;
            }
            case 'dismissed':
                this.onCancel();
                break;
            default:
                console.warn('Received unknown DatePicker event:', event);
        }
    }

    render() {
        const { visible, theme } = this.props;

        if (Platform.OS === 'android') {
            return this.renderAndroidPickerModal();
        }
        const modalStyle: ViewStyle = {
            borderRadius: theme.roundness,
            overflow: 'hidden',
        };

        if (DatePicker.isIntegrated({ mode: this.props.mode })) {
            return Platform.OS === 'ios'
                ? this.renderIOSPickerView()
                : this.renderFallbackPickerView();
        }

        const modalContent =
            Platform.OS === 'ios' ? (
                <Surface style={[styles.iosModalContainer, modalStyle]}>
                    <View style={styles.iosDatePickerContainer}>
                        {this.renderIOSPickerView()}
                    </View>
                    {this.renderButtons()}
                </Surface>
            ) : (
                <Surface style={[styles.modalContainer, modalStyle]}>
                    {this.renderFallbackPickerView()}
                    {this.renderButtons()}
                </Surface>
            );
        return (
            <Portal theme={theme}>
                <Modal
                    visible={visible}
                    onDismiss={() => this.onCancel()}
                    contentContainerStyle={this.modalContentStyle()}
                    theme={theme}
                >
                    {modalContent}
                </Modal>
            </Portal>
        );
    }

    private renderAndroidPickerModal() {
        const { futureDisabled, mode, visible } = this.props;
        const { date } = this.state;

        return (
            visible && (
                <NativeDatePicker
                    value={date.toDate()}
                    display='default'
                    disabled={this.props.disabled}
                    mode={mode}
                    onChange={(event: any, date: Date) =>
                        this.handleAndroidModalEvent(event, date)
                    }
                    maximumDate={futureDisabled && this.maximumDate().toDate()}
                />
            )
        );
    }

    private renderIOSPickerView(props?: ViewProps) {
        const { futureDisabled, mode, theme } = this.props;
        const { date } = this.state;

        return (
            <NativeDatePicker
                {...props}
                value={date.toDate()}
                display={iOSDisplay}
                disabled={this.props.disabled}
                mode={mode}
                onChange={(event: any, date: Date) => this.onChange(date)}
                maximumDate={futureDisabled && this.maximumDate().toDate()}
                textColor={theme.colors.text}
                locale={getCurrentLocale()}
            />
        );
    }

    private renderFallbackPickerView() {
        switch (this.props.mode) {
            case 'date':
                return this.renderCalendar();
            default:
                throw new Error(
                    `Unsupported fallback date picker mode: ${this.props.mode}`
                );
        }
    }

    private renderCalendar() {
        const { futureDisabled, theme } = this.props;
        const calendarValue = this.calendarDate(this.state.date);

        return (
            <Calendar
                current={calendarValue}
                markedDates={{
                    [calendarValue]: { selected: true },
                }}
                onDayPress={(day: any) => this.onChange(moment(day.timestamp))}
                onDayLongPress={(day: any) =>
                    this.onChange(moment(day.timestamp))
                }
                maxDate={
                    futureDisabled ? this.calendarDate(this.today()) : undefined
                }
                renderArrow={(direction: string) => this.renderArrow(direction)}
                style={styles.calendar}
                theme={{
                    backgroundColor: theme.colors.background,
                    calendarBackground: theme.colors.surface,
                    textSectionTitleColor: theme.colors.text,
                    selectedDayBackgroundColor: theme.colors.accent,
                    selectedDayTextColor: theme.colors.surface,
                    todayTextColor: theme.colors.accent,
                    dayTextColor: theme.colors.text,
                    textDisabledColor: theme.colors.disabled,
                    dotColor: theme.colors.primary,
                    selectedDotColor: theme.colors.surface,
                    arrowColor: theme.colors.accent,
                    // disabledArrowColor: theme.colors.disabled,
                    monthTextColor: theme.colors.text,
                    indicatorColor: theme.colors.primary,
                    // textDayFontFamily: 'monospace',
                    // textMonthFontFamily: 'monospace',
                    // textDayHeaderFontFamily: 'monospace',
                    // textDayFontWeight: '300',
                    textMonthFontWeight: 'medium',
                    // textDayHeaderFontWeight: '300',
                    // textDayFontSize: 16,
                    // textMonthFontSize: 16,
                    // textDayHeaderFontSize: 16
                }}
            />
        );
    }

    private renderButtons() {
        if (DatePicker.submitOnChangeSupported && this.props.submitOnChange) {
            return null;
        }
        return (
            <View style={styles.calendarButtons}>
                {this.props.mode === 'date' && (
                    <Button
                        title={lz('today')}
                        onPress={() => this._setDate(this.today())}
                        compact
                        color={this.props.theme.colors.accent}
                        style={styles.calendarButton}
                    />
                )}
                <Button
                    title={lz('cancel')}
                    onPress={() => this.onCancel()}
                    compact
                    style={styles.calendarButton}
                />
                <Button
                    title={lz('done')}
                    mode='contained'
                    onPress={() => this.onSubmit()}
                    compact
                    style={styles.calendarButton}
                />
            </View>
        );
    }

    private renderArrow(direction: string) {
        const size = 18;
        const color = this.props.theme.colors.accent;
        switch (direction) {
            case 'left':
                return (
                    FormAssets.shared.LeftArrowIcon && (
                        <FormAssets.shared.LeftArrowIcon
                            size={size}
                            color={color}
                        />
                    )
                );
            case 'right':
                return (
                    FormAssets.shared.RightArrowIcon && (
                        <FormAssets.shared.RightArrowIcon
                            size={size}
                            color={color}
                        />
                    )
                );
            default:
                throw new Error(`Bad arrow direction: ${direction}`);
        }
    }

    private today(): Moment {
        return this.cleanDate(moment());
    }

    private maximumDate(): Moment {
        switch (this.props.mode) {
            case 'date':
                return this.today();
            case 'time':
                return this.cleanDate(moment().add(1, 'minute'));
            default:
                throw new Error(
                    `Unsupported date picker mode: ${this.props.mode}`
                );
        }
    }

    private cleanDate(date: any): Moment {
        switch (this.props.mode) {
            case 'date':
                return moment(date).clone().startOf('day');
            case 'time':
                return moment(date).clone().startOf('minute');
            default:
                throw new Error(
                    `Unsupported date picker mode: ${this.props.mode}`
                );
        }
    }

    private calendarDate(date: any): string {
        return moment(date).format('YYYY-MM-DD');
    }

    private modalContentStyle() {
        const { theme } = this.props;
        return [
            styles.modal,
            {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.roundness,
            },
        ];
    }
}

const styles = StyleSheet.create({
    modal: {
        maxWidth: 400,
        alignSelf: 'center',
    },
    iosModalContainer: isIOS14Like
        ? {
              justifyContent: 'space-between',
              padding: 8,
          }
        : {
              justifyContent: 'space-between',
              paddingBottom: 8,
          },
    iosDatePickerContainer: isIOS14Like
        ? {
              height: 300,
              width: 320,
          }
        : {
              height: 216,
              width: 320,
          },
    modalContainer: {
        flex: 1,
    },
    calendar: {
        minWidth: 320,
        height: 360,
    },
    calendarButtons: {
        flex: 1,
        flexDirection: 'row',
        marginRight: 12,
        maxHeight: 45,
    },
    calendarButton: {
        flex: 1,
        marginLeft: 12,
    },
});

export default withTheme(DatePicker);
