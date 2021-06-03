import { map } from 'rxjs/operators';
import LabelFieldModel, { LabelFieldModelOptions } from './LabelFieldModel';

export interface ErrorFieldModelOwnOptions {
    formatErrors?: (errors: Error[]) => string;
}

export interface ErrorFieldModelOptions
    extends ErrorFieldModelOwnOptions,
        Omit<LabelFieldModelOptions, 'title'> {}

export default class ErrorFieldModel extends LabelFieldModel {
    readonly formatErrors: (errors: Error[]) => string;

    constructor(options: ErrorFieldModelOptions) {
        let optionsWithDefaults = ErrorFieldModel.optionsWithDefaults(options);
        super(optionsWithDefaults);
        this.formatErrors = optionsWithDefaults.formatErrors;
    }

    static optionsWithDefaults(
        options: ErrorFieldModelOptions
    ): ErrorFieldModelOptions &
        Required<
            ErrorFieldModelOwnOptions & Pick<LabelFieldModelOptions, 'title'>
        > {
        const row =
            options.form.sections[options.sectionIndex].rows[options.rowIndex];

        const {
            formatErrors = errors => errors.map(e => e.message).join('\n'),
        } = options;
        const title = row.flattenedErrors$().pipe(map(formatErrors));
        const { visible = title.pipe(map(e => !!e)) } = options;

        const style = { ...options.style, marginTop: 0, paddingTop: 0 };

        return {
            ...options,
            formatErrors,
            title,
            visible,
            style,
        };
    }
}
