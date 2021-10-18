import FieldModel, { FieldModelOptions } from './FieldModel';

interface LineBreakFieldModelOwnOptions {
    lineHeight?: number;
    flex?: number;
    marginTop?: number;
    marginBottom?: number;
    /** Modify the current line instead of adding a new line. */
    modifyLine?: boolean;
}

export interface LineBreakFieldModelOptions
    extends LineBreakFieldModelOwnOptions,
        FieldModelOptions {}

export default class LineBreakFieldModel
    extends FieldModel
    implements LineBreakFieldModelOwnOptions
{
    lineHeight?: number;
    flex?: number;
    marginTop?: number;
    marginBottom?: number;
    modifyLine: boolean;

    constructor(options: LineBreakFieldModelOptions) {
        super(options);
        this.lineHeight = options.lineHeight;
        this.flex = options.flex;
        this.marginTop = options.marginTop;
        this.marginBottom = options.marginBottom;
        this.modifyLine = options.modifyLine || false;
    }
}
