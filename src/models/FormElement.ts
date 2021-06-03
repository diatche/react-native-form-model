import { WeakRef } from '@ungap/weakrefs';
import _ from 'lodash';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import FieldModel from './FieldModel';
import FormModel from './FormModel';
import { FormStyle, kDefaultFormStyle, PartialFormStyle } from './FormStyle';
import { isInputFieldModelLike } from './formTypes';

let _keyCounter = 0;

export interface FormElementOptions {
    key?: string;
    form: FormModel;
    style?: PartialFormStyle;
    // sectionIndex?: number;
    // rowIndex?: number;
    // fieldIndex?: number;
}

export interface ErrorOptions {
    editedOnly?: boolean;
}

export interface EditableFieldModel {
    edited: BehaviorSubject<boolean>;
}

export default abstract class FormElement {
    key: string;
    style?: PartialFormStyle;
    sectionIndex = -1;
    rowIndex = -1;
    fieldIndex = -1;

    private _formRef?: WeakRef<FormModel>;

    constructor(options: FormElementOptions) {
        let { key = `${++_keyCounter}_${this.constructor.name}` } = options;
        this.key = key;
        this.form = options.form;
        this.style = _.cloneDeep(options.style);
        // this.sectionIndex = options.sectionIndex || -1;
        // this.rowIndex = options.rowIndex || -1;
        // this.fieldIndex = options.fieldIndex || -1;
    }

    get form(): FormModel {
        let form = this._formRef?.deref();
        if (!form) {
            throw new Error('Trying to access a released object');
        }
        return form;
    }

    set form(form: FormModel) {
        this._formRef = new WeakRef(form);
    }

    modify(callback: (element: this) => any): this {
        callback(this);
        return this;
    }

    validateAll(options?: { focusOnInvalid?: boolean }) {
        // Prevent import InputFieldModel to avoid circular dependency
        let didFocus = false;
        let allValid = true;
        for (let field of this.iterateFields()) {
            if (isInputFieldModelLike(field)) {
                let { valid } = field.validate();
                if (!valid) {
                    allValid = false;
                    if (
                        !didFocus &&
                        options?.focusOnInvalid &&
                        field.viewRef?.current?.focus
                    ) {
                        didFocus = true;
                        field.viewRef.current.focus();
                    }
                }
            }
        }
        return allValid;
    }

    valid(): boolean {
        return this.fieldsWithErrors().length === 0;
    }

    valid$(): Observable<boolean> {
        return this.fieldsWithErrors$().pipe(
            map(fields => fields.length === 0),
            distinctUntilChanged()
        );
    }

    fieldsWithErrors({ editedOnly = false }: ErrorOptions = {}): FieldModel[] {
        let fieldsWithErrors: FieldModel[] = [];
        for (let field of this.iterateFields()) {
            if (field.errors.value.length !== 0) {
                if (
                    editedOnly &&
                    (!field.isEditable() || !field.edited.value)
                ) {
                    continue;
                }
                fieldsWithErrors.push(field);
            }
        }
        return fieldsWithErrors;
    }

    fieldsWithErrors$({ editedOnly = false }: ErrorOptions = {}): Observable<
        FieldModel[]
    > {
        const fields = this.allFields();
        if (fields.length === 0) {
            return of([]);
        }
        const fieldCount = fields.length;
        let errorData = fields.map(field => field.errors);
        let editedData = editedOnly
            ? fields.map(field =>
                  field.isEditable() ? field.edited : of(true)
              )
            : [of(true)];

        return combineLatest([
            combineLatest(errorData),
            combineLatest(editedData),
        ]).pipe(
            map(data => {
                let [errorsPerField, editedFlags] = data;
                let fieldsWithErrors: FieldModel[] = [];
                if (errorsPerField.length !== fieldCount) {
                    throw new Error(
                        'Modifying fields after subscribing to fieldsWithErrors$() is not supported'
                    );
                }
                for (let i = 0; i < fieldCount; i++) {
                    if (editedOnly && !editedFlags[i]) {
                        continue;
                    }
                    let fieldErrors = errorsPerField[i];
                    if (fieldErrors.length !== 0) {
                        fieldsWithErrors.push(fields[i]);
                    }
                }
                return fieldsWithErrors;
            })
        );
    }

    flattenedErrors$(options?: ErrorOptions): Observable<Error[]> {
        return this.fieldsWithErrors$(options).pipe(
            map(fields => _.flatMap(fields, f => f.errors.value))
        );
    }

    flattenedFormattedErrors$(
        options: ErrorOptions & {
            formatter?: (errors: Error[]) => string;
        } = {}
    ): Observable<string> {
        const {
            formatter = errors => errors.map(e => e.message).join('\n'),
        } = options;
        return this.flattenedErrors$(options).pipe(
            map(errors => formatter(errors))
        );
    }

    allFields(): FieldModel[] {
        let fields: FieldModel[] = [];
        for (let field of this.iterateFields()) {
            fields.push(field);
        }
        return fields;
    }

    visibleFields$(): Observable<FieldModel[]> {
        const fields = this.allFields();
        const fieldCount = fields.length;
        return combineLatest(
            fields.map(field => {
                if (field.visible instanceof Observable) {
                    return field.visible;
                } else {
                    return of(field.visible);
                }
            })
        ).pipe(
            map(visibleFlags => {
                let visibleFields: FieldModel[] = [];
                if (visibleFlags.length !== fieldCount) {
                    throw new Error(
                        'Modifying fields after subscribing to visibleFields$() is not supported'
                    );
                }
                for (let i = 0; i < fieldCount; i++) {
                    if (visibleFlags[i]) {
                        visibleFields.push(fields[i]);
                    }
                }
                return visibleFields;
            })
        );
    }

    *iterateFields(): Generator<FieldModel> {
        if (this.form) {
            if (this.sectionIndex >= 0) {
                // Iterate this section only
                let section = this.form.sections[this.sectionIndex];
                if (this.rowIndex >= 0) {
                    // Iterate this row only
                    let row = section.rows[this.rowIndex];
                    if (this.fieldIndex >= 0) {
                        // Iterate this field only
                        yield row.fields[this.fieldIndex];
                    } else {
                        // Iterate all fields
                        for (let field of row.fields) {
                            yield field;
                        }
                    }
                } else {
                    // Iterate all rows
                    for (let row of section.rows) {
                        for (let field of row.iterateFields()) {
                            yield field;
                        }
                    }
                }
            } else {
                // Iterate all sections
                for (let section of this.form.sections) {
                    for (let field of section.iterateFields()) {
                        yield field;
                    }
                }
            }
        }
    }

    resolveStyle(theme?: PartialFormStyle): Required<FormStyle> {
        let style: Required<FormStyle> = _.merge({}, kDefaultFormStyle, theme);
        if (this.form) {
            if (this.sectionIndex >= 0) {
                let section = this.form.sections[this.sectionIndex];
                if (section.style) {
                    style = _.merge(style, section.style);
                }

                if (this.rowIndex >= 0) {
                    let row = section.rows[this.rowIndex];
                    if (row.style) {
                        style = _.merge(style, row.style);
                    }

                    if (this.fieldIndex >= 0) {
                        let field = row.fields[this.fieldIndex];
                        if (field.style) {
                            style = _.merge(style, field.style);
                        }
                    }
                }
            }
        }
        return style;
    }

    resolveStyleValue<K extends keyof FormStyle>(
        key: K,
        theme?: PartialFormStyle
    ): FormStyle[K] {
        let value: FormStyle[K] = kDefaultFormStyle[key];
        if (theme?.[key]) {
            value = FormElement._mergeStyleValues<FormStyle[K]>(
                value,
                theme[key] as FormStyle[K] | undefined
            );
        }
        if (this.form) {
            if (this.sectionIndex >= 0) {
                let section = this.form.sections[this.sectionIndex];
                if (section.style && key in section.style) {
                    value = FormElement._mergeStyleValues<FormStyle[K]>(
                        value,
                        section.style[key] as FormStyle[K] | undefined
                    );
                }

                if (this.rowIndex >= 0) {
                    let row = section.rows[this.rowIndex];
                    if (row.style && key in row.style) {
                        value = FormElement._mergeStyleValues<FormStyle[K]>(
                            value,
                            row.style[key] as FormStyle[K] | undefined
                        );
                    }

                    if (this.fieldIndex >= 0) {
                        let field = row.fields[this.fieldIndex];
                        if (field.style && key in field.style) {
                            value = FormElement._mergeStyleValues<FormStyle[K]>(
                                value,
                                field.style[key] as FormStyle[K] | undefined
                            );
                        }
                    }
                }
            }
        }
        return value;
    }

    private static _mergeStyleValues<T>(a: T, b?: T): T {
        let isObjA = _.isPlainObject(a);
        let isObjB = _.isPlainObject(b);
        if (isObjA && isObjB) {
            return _.merge({}, a, b);
        } else if (isObjA || typeof b === 'undefined') {
            return a;
        } else {
            return b;
        }
    }
}
