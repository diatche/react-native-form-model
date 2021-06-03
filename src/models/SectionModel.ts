import { MaybeObservable } from '../util/reactUtil';
import FormElement, { FormElementOptions } from './FormElement';
import RowModel, { RowModelOptions } from './RowModel';

export interface SectionModelOptions extends FormElementOptions {
    sectionIndex: number;
    title?: MaybeObservable<string> | (() => React.ReactNode);
    footer?: MaybeObservable<string> | (() => React.ReactNode);
}

export default class SectionModel extends FormElement {
    title: MaybeObservable<string> | (() => React.ReactNode);
    footer: MaybeObservable<string> | (() => React.ReactNode);
    rows: RowModel[] = [];

    constructor(options: SectionModelOptions) {
        super(options);
        this.sectionIndex = options.sectionIndex;
        let { title = '', footer = '' } = options;
        this.title = title;
        this.footer = footer;
    }

    addRow(
        options?: Omit<RowModelOptions, 'form' | 'sectionIndex' | 'rowIndex'>
    ): RowModel {
        let row = new RowModel({
            ...options,
            form: this.form,
            sectionIndex: this.sectionIndex,
            rowIndex: this.rows.length,
        });
        this.rows.push(row);
        return row;
    }

    setTitle(title: Required<SectionModelOptions>['title']) {
        this.title = title || '';
        return this;
    }

    setFooter(footer: Required<SectionModelOptions>['footer']) {
        this.footer = footer || '';
        return this;
    }
}
