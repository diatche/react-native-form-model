import _ from 'lodash';
import { GestureResponderEvent } from 'react-native';
import { BehaviorSubject, Observable } from 'rxjs';

import {
    CustomFieldModel,
    CustomFieldModelOptions,
    DateInputFieldModel,
    DateInputFieldModelOptions,
    FieldModel,
    FieldModelOptions,
    InputFieldModelOptions,
    KeyboardInputFieldModel,
    KeyboardInputFieldModelOptions,
    LabelFieldModel,
    LabelFieldModelOptions,
    LineBreakFieldModel,
    LineBreakFieldModelOptions,
    OptionInputFieldModel,
    OptionInputFieldModelOptions,
    SwitchInputFieldModel,
    SwitchInputFieldModelOptions,
    TimeInputFieldModel,
    TimeInputFieldModelOptions,
} from './FieldModel';
import ButtonFieldModel, {
    ButtonFieldModelOptions,
} from './FieldModel/ButtonFieldModel';
import ErrorFieldModel, {
    ErrorFieldModelOptions,
} from './FieldModel/ErrorFieldModel';
import InputFieldModel from './FieldModel/InputFieldModel';
import FormElement, { FormElementOptions } from './FormElement';

export type ModifierType = 'margin';

export type RowOnPressCallback = (
    row: RowModel,
    event: GestureResponderEvent
) => any;

export interface RowModelOptions extends FormElementOptions {
    onPress?: RowOnPressCallback;
    sectionIndex: number;
    rowIndex: number;
}

type AddFieldModelOverrideKeys =
    | 'form'
    | 'sectionIndex'
    | 'rowIndex'
    | 'fieldIndex';
type AddFieldModelOptionOverrides = Pick<
    FieldModelOptions,
    AddFieldModelOverrideKeys
>;
export type AddFieldModelOptions = Omit<
    FieldModelOptions,
    AddFieldModelOverrideKeys
>;

export interface FormModifier {
    type: ModifierType;
    value: any;
}

export default class RowModel extends FormElement {
    onPress: RowOnPressCallback | undefined;
    fields: FieldModel[] = [];
    sectionIndex: number;
    rowIndex: number;

    private _modifiers: FormModifier[] = [];

    constructor(options: RowModelOptions) {
        super(options);
        this.onPress = options.onPress;
        this.sectionIndex = options.sectionIndex;
        this.rowIndex = options.rowIndex;
    }

    get lastField(): FieldModel | undefined {
        const c = this.fields.length;
        return c !== 0 ? this.fields[c - 1] : undefined;
    }

    getSection() {
        return this.form.sections[this.sectionIndex];
    }

    isFirstRow() {
        return this.rowIndex === 0;
    }

    isLastRow() {
        return this.rowIndex === this.getSection().rows.length - 1;
    }

    addField(field: FieldModel) {
        this.fields.push(field);
        this._applyModifiers();
        return this;
    }

    addFlex(
        optionsOrFlex?:
            | Omit<FieldModelOptions, AddFieldModelOverrideKeys>
            | FieldModelOptions['flex']
    ) {
        let options: Omit<FieldModelOptions, AddFieldModelOverrideKeys>;
        if (optionsOrFlex && typeof optionsOrFlex === 'object') {
            options = optionsOrFlex;
        } else {
            options = { flex: optionsOrFlex || 1 };
        }
        return this.addField(
            new FieldModel({
                ...options,
                ...this._fieldOptionsOverrides(),
            })
        );
    }

    /** Add a new line. */
    addLine(
        options?: Omit<LineBreakFieldModelOptions, AddFieldModelOverrideKeys>
    ) {
        return this.addField(
            new LineBreakFieldModel({
                ...options,
                ...this._fieldOptionsOverrides(),
            })
        );
    }

    /** Modify the current line. */
    setLine(
        options?: Omit<LineBreakFieldModelOptions, AddFieldModelOverrideKeys>
    ) {
        return this.addLine({ ...options, modifyLine: true });
    }

    addLabel(
        optionsOrTitle:
            | Omit<LabelFieldModelOptions, AddFieldModelOverrideKeys>
            | LabelFieldModelOptions['title']
    ) {
        let options: Omit<LabelFieldModelOptions, AddFieldModelOverrideKeys>;
        if (
            typeof optionsOrTitle === 'string' ||
            optionsOrTitle instanceof Observable
        ) {
            options = { title: optionsOrTitle };
        } else {
            options = optionsOrTitle;
        }
        return this.addField(
            new LabelFieldModel({
                ...options,
                ...this._fieldOptionsOverrides(),
            })
        );
    }

    addErrorLabel(
        options?: Omit<ErrorFieldModelOptions, AddFieldModelOverrideKeys>
    ) {
        return this.addField(
            new ErrorFieldModel({
                ...options,
                ...this._fieldOptionsOverrides(),
            })
        );
    }

    addErrorLine(
        options?: Omit<
            ErrorFieldModelOptions & LineBreakFieldModelOptions,
            AddFieldModelOverrideKeys
        >
    ) {
        const line = new LineBreakFieldModel({
            ...options,
            ...this._fieldOptionsOverrides(),
        });
        const field = new ErrorFieldModel({
            ...options,
            ...this._fieldOptionsOverrides(),
        });
        line.visible = field.visible;
        this.addField(line);
        this.addField(field);
        return this;
    }

    addCustom(
        optionsOrRender:
            | Omit<CustomFieldModelOptions, AddFieldModelOverrideKeys>
            | CustomFieldModelOptions['render']
    ) {
        let options: Omit<CustomFieldModelOptions, AddFieldModelOverrideKeys>;
        if (typeof optionsOrRender === 'function') {
            options = { render: optionsOrRender };
        } else {
            options = optionsOrRender;
        }
        return this.addField(
            new CustomFieldModel({
                ...options,
                ...this._fieldOptionsOverrides(),
            })
        );
    }

    addKeyboardInput<T>(
        options: Omit<
            KeyboardInputFieldModelOptions<T>,
            AddFieldModelOverrideKeys
        >
    ) {
        return this.addField(
            new KeyboardInputFieldModel<T>({
                ...options,
                ...this._fieldOptionsOverrides(),
            })
        );
    }

    addButton(
        options: Omit<ButtonFieldModelOptions, AddFieldModelOverrideKeys>
    ) {
        return this.addField(
            new ButtonFieldModel({
                ...options,
                ...this._fieldOptionsOverrides(),
            })
        );
    }

    addDateInput(
        options: Omit<DateInputFieldModelOptions, AddFieldModelOverrideKeys>
    ) {
        return this.addField(
            new DateInputFieldModel({
                ...options,
                ...this._fieldOptionsOverrides(),
            })
        );
    }

    addTimeInput(
        options: Omit<TimeInputFieldModelOptions, AddFieldModelOverrideKeys>
    ) {
        return this.addField(
            new TimeInputFieldModel({
                ...options,
                ...this._fieldOptionsOverrides(),
            })
        );
    }

    addOptionInput<T>(
        options: Omit<
            OptionInputFieldModelOptions<T>,
            AddFieldModelOverrideKeys
        >
    ) {
        return this.addField(
            new OptionInputFieldModel<T>({
                ...options,
                ...this._fieldOptionsOverrides(),
            })
        );
    }

    addSwitchInput(
        options:
            | Omit<SwitchInputFieldModelOptions, AddFieldModelOverrideKeys>
            | BehaviorSubject<boolean>
    ) {
        if (options instanceof BehaviorSubject) {
            options = { value: options };
        }
        return this.addField(
            new SwitchInputFieldModel({
                ...options,
                ...this._fieldOptionsOverrides(),
            })
        );
    }

    addInputLabel<T, I = T>(
        options: Omit<InputFieldModelOptions<T, I>, AddFieldModelOverrideKeys>
    ) {
        return this.addField(
            new InputFieldModel<T, I>({
                ...options,
                ...this._fieldOptionsOverrides(),
            })
        );
    }

    /** Set margin between two fields (once). */
    setMargin(margin: number) {
        this._modifiers.push({ type: 'margin', value: margin });
        return this;
    }

    private _applyModifiers() {
        if (this._modifiers.length !== 0) {
            for (const modifier of this._modifiers) {
                switch (modifier.type) {
                    case 'margin':
                        this._applyMarginModifier(modifier);
                        continue;
                }
                throw new Error('Invalid modifier type');
            }
            this._modifiers = [];
        }
    }

    private _applyMarginModifier(modifier: FormModifier) {
        // Remove margin between last two fields
        let marginRemaining = modifier.value;
        const prevField = this.fields[this.fields.length - 2];
        if (prevField) {
            const marginPrev = Math.floor(marginRemaining / 2);
            marginRemaining -= marginPrev;
            prevField.style = _.merge(prevField.style || {}, {
                marginRight: marginPrev,
            });
        }
        const field = this.fields[this.fields.length - 1];
        field.style = _.merge(field.style || {}, {
            marginLeft: marginRemaining,
        });
    }

    private _fieldOptionsOverrides(): AddFieldModelOptionOverrides {
        return {
            form: this.form,
            sectionIndex: this.sectionIndex,
            rowIndex: this.rowIndex,
            fieldIndex: this.fields.length,
        };
    }
}
