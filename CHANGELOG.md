# Change Log

## main

Changes on `main` will be listed here.

-   Deeper reds in dark mode color defaults.

## 0.9.0

28 Oct 2021

### Features

-   [[#14](https://github.com/diatche/react-native-form-model/pull/14)] Added `autoFocus` to `InputFieldModel`.

## 0.8.0

26 Oct 2021

-   [[#13](https://github.com/diatche/react-native-form-model/pull/13)] Input labels are now accessible.
-   [[#13](https://github.com/diatche/react-native-form-model/pull/13)] Select next form field on editing submit.
    -   It's possible to skip fields when editing is submitted on a field with the `skipNextFocus` property.
    -   When there are no more fields to focus after submitting, `onSubmit` is called on the form.
-   [[#13](https://github.com/diatche/react-native-form-model/pull/13)] Added `returnKeyType` to `KeyboardInputFieldModel`.

## 0.7.0

19 Oct 2021

### Features

-   [[#12](https://github.com/diatche/react-native-form-model/pull/12)] Added `confirmingDelete` flag to `Row`, which changes the delete icon to be more pronouced.

### Breaking Changes

-   [[#11](https://github.com/diatche/react-native-form-model/pull/11)] `createBehaviorSubject` renamed to `useValueAsBehaviorSubject`.
-   [[#11](https://github.com/diatche/react-native-form-model/pull/11)] Removed default export from `FieldModel` directory.

### Other

-   [[#11](https://github.com/diatche/react-native-form-model/pull/11)] Added ESLint.

## 0.6.1

18 Aug 2021

### Bug Fixes

-   Fixed centered label field alignment.

## 0.6.0

16 Aug 2021

### Features

-   [[#10](https://github.com/diatche/react-native-form-model/pull/10)] Added button field model.

## 0.5.0 - 0.5.1

6 Aug 2021

### Features

-   [[#9](https://github.com/diatche/react-native-form-model/pull/9)] Added `mode` property to keyboard input and time inputs. There are two modes, `plain` and `contained`. The default mode is `plain` (matches the previous style).

### Bug Fixes

-   [[#9](https://github.com/diatche/react-native-form-model/pull/9)] Fixed a bug where a time input field height would be smaller than the row.
-   Fixed a bug where a text input field height would be smaller than the row.

## 0.4.4

3 Aug 2021

### Breaking Changes

-   Segmented control no longer uses flex wrap by default. This can be added in `style`.

## 0.4.2 - 0.4.3

1 Jul 2021

### Bug Fixes

-   [[#8](https://github.com/diatche/react-native-form-model/pull/8)] Fixed a bug where a text input's latest pending value would not be commited in some native UI situations.
-   [[#7](https://github.com/diatche/react-native-form-model/pull/7)] Fixed picker label alignment.

## 0.4.1

25 Jun 2021

### Features

-   [[#6](https://github.com/diatche/react-native-form-model/pull/6)] Added `disabled` property to label fields.
-   [[#6](https://github.com/diatche/react-native-form-model/pull/6)] Buttons now adjust font size to fit.

### Bug Fixes

-   [[#6](https://github.com/diatche/react-native-form-model/pull/6)] Improved layout when form is displayed with insufficient width.

## 0.4.0

16 Jun 2021

### Features

-   [[#4](https://github.com/diatche/react-native-form-model/pull/4)] Option input field is no longer limited to string and number values.
-   [[#5](https://github.com/diatche/react-native-form-model/pull/5)] Added `dialog` mode to option input field, which uses a new `OptionList` component in iOS and web.
-   [[#5](https://github.com/diatche/react-native-form-model/pull/5)] Added `CheckmarkIcon` to `FormAssets`.

### Breaking Changes

-   [[#5](https://github.com/diatche/react-native-form-model/pull/5)] Renamed option input field property `type` to `mode`.
-   [[#5](https://github.com/diatche/react-native-form-model/pull/5)] Renamed option input field types `segmentedControl` and `picker` to `segmented` and `dropdown` respectively.
-   [[#5](https://github.com/diatche/react-native-form-model/pull/5)] Picker now accepts `possibleValues`, `selectedIndex`, `serializer` and `formatValue`, instead of `children`, `selectedTitle` etc.
-   [[#5](https://github.com/diatche/react-native-form-model/pull/5)] `Form` component no longer has a built in vertical margin.

## 0.3.0

15 Jun 2021

### Features

-   [[#3](https://github.com/diatche/react-native-form-model/pull/3)] Added `selectTextOnFocus` and `clearButtonMode` to `KeyboardInputFieldModel` and `TimeInputFieldModel`.

### Bug Fixes

-   [[#2](https://github.com/diatche/react-native-form-model/pull/2)] Fixed a bug when a a NaN number was set as the value.

## 0.2.0

11 Jun 2021

### Features

-   [[#1](https://github.com/diatche/react-native-form-model/pull/1)] Added `textStyle` and `outline` mode to `Button`.
