import FormElement, { FormElementOptions } from './FormElement';
import { FormStyle } from './FormStyle';
import SectionModel, { SectionModelOptions } from './SectionModel';

type ForwardElementOptions = Omit<FormElementOptions, 'form'>;

export interface FormModelOptions extends ForwardElementOptions {
    showErrors?: boolean;
}

export default class FormModel extends FormElement {
    sections: SectionModel[] = [];
    showErrors: boolean;
    style?: FormStyle;

    get form(): FormModel {
        return this;
    }

    set form(form: FormModel) {}

    constructor(options: FormModelOptions = {}) {
        super({ ...options, form: {} as FormModel });
        const { showErrors = false } = options;
        this.showErrors = showErrors;
    }

    static create(options?: FormModelOptions): FormModel {
        return new FormModel(options);
    }

    static empty() {
        return new FormModel();
    }

    reset() {
        this.sections = [];
    }

    addSection(
        options?: Omit<SectionModelOptions, 'form' | 'sectionIndex'>
    ): SectionModel {
        const section = new SectionModel({
            ...options,
            form: this,
            sectionIndex: this.sections.length,
        });
        this.sections.push(section);
        return section;
    }
}
