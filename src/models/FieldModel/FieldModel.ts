import { BehaviorSubject } from 'rxjs';

import { MaybeObservable } from '../../util/reactUtil';
import FormElement, {
    EditableFieldModel,
    FormElementOptions,
} from '../FormElement';
import { FieldModelLike, FieldViewLike, ViewRef } from '../formTypes';

export type FieldAlignment = 'left' | 'center' | 'right';

export interface FieldModelOptions extends FormElementOptions {
    sectionIndex: number;
    rowIndex: number;
    fieldIndex: number;
    align?: FieldAlignment;
    flex?: number;
    /** Whether to show this field. */
    visible?: MaybeObservable<boolean>;
}

export default class FieldModel<View extends FieldViewLike = any>
    extends FormElement
    implements FieldModelLike<View>
{
    readonly errors: BehaviorSubject<Error[]>;
    sectionIndex: number;
    rowIndex: number;
    fieldIndex: number;
    align: FieldAlignment;
    flex?: number;
    visible: MaybeObservable<boolean>;
    viewRef?: ViewRef<View>;

    /**
     * Whether this field is currently rendered on the screen.
     * Do not set this value directly.
     */
    isMounted: boolean;

    constructor(options: FieldModelOptions) {
        super(options);
        const { align = 'left', visible = true } = options;
        this.errors = new BehaviorSubject<Error[]>([]);
        this.sectionIndex = options.sectionIndex;
        this.rowIndex = options.rowIndex;
        this.fieldIndex = options.fieldIndex;
        this.align = align;
        this.flex = options.flex;
        this.visible = visible;
        this.isMounted = false;
    }

    isEditable(): this is EditableFieldModel {
        return false;
    }

    /**
     * Called after the view is mounted.
     *
     * Subclasses must call the super implementation.
     */
    onMount(viewRef: ViewRef<View>) {}

    /** Called before the view is unmounted.
     *
     * Subclasses must call the super implementation.
     */
    onUnmount(viewRef: ViewRef<View>) {}
}
