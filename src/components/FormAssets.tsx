import React from 'react';
import { ViewProps } from 'react-native';

export interface FormIconProps extends ViewProps {
    size: number;
    color?: string;
}

export type FormIconComponent = React.FC<FormIconProps>;

export interface FormAssetsConfig {
    ClearIcon?: FormIconComponent;
    CheckmarkIcon?: FormIconComponent;
    LeftArrowIcon?: FormIconComponent;
    RightArrowIcon?: FormIconComponent;
}

export default class FormAssets implements FormAssetsConfig {
    ClearIcon?: FormIconComponent;
    CheckmarkIcon?: FormIconComponent;
    LeftArrowIcon?: FormIconComponent;
    RightArrowIcon?: FormIconComponent;

    static _shared?: FormAssets;

    constructor(config: FormAssetsConfig) {
        this.ClearIcon = config.ClearIcon;
        this.CheckmarkIcon = config.CheckmarkIcon;
        this.LeftArrowIcon = config.LeftArrowIcon;
        this.RightArrowIcon = config.RightArrowIcon;
    }

    static get shared(): FormAssets {
        if (!this._shared) {
            throw new Error('You must set a shared FormAssets instance');
        }
        return this._shared;
    }

    static set shared(shared: FormAssets) {
        if (!(shared instanceof FormAssets)) {
            throw new Error('Invalid FormAssets instance');
        }
        this._shared = shared;
    }
}
