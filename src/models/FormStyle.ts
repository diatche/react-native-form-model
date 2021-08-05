import { TextStyle } from 'react-native';
import { Colors } from 'react-native-paper';

declare global {
    namespace ReactNativePaper {
        interface PaperThemeWithForm extends Theme {
            form: Required<FormStyle>;
        }
    }
}

export interface PaperThemeWithForm
    extends ReactNativePaper.PaperThemeWithForm {}

type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

export interface FormStyle {
    sectionMargin?: number;
    roundness?: number;
    rowHeight?: number;
    fieldHeight?: number;
    fontSize?: number;
    errorFontSize?: number;
    fontWeight?: TextStyle['fontWeight'];
    inputFontWeight?: TextStyle['fontWeight'];
    sectionTitleAlign?: TextStyle['textAlign'];
    sectionFooterAlign?: TextStyle['textAlign'];

    colors: FormColors;

    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    marginTop?: number;
    marginBottom?: number;
}

export type PartialFormStyle = DeepPartial<FormStyle>;

export interface FormColors {
    label?: string;
    input?: string;
    error?: string;
    disabled?: string;
    destructive?: string;
    buttonForeground?: string;
    buttonBackground?: string;
    sectionTitle?: string;
    sectionFooter?: string;
    divider?: string;
    formBackground?: string;
    containedTextBackground?: string;
}

export type RequiredFormColors = Required<Omit<FormColors, 'formBackground'>>;

export const kDefaultLightFormColors: RequiredFormColors = {
    label: Colors.grey900,
    input: Colors.blue600,
    error: Colors.red700,
    disabled: Colors.grey700,
    destructive: Colors.red700,
    buttonForeground: Colors.white,
    buttonBackground: Colors.blue600,
    sectionTitle: Colors.grey700,
    sectionFooter: Colors.grey700,
    divider: Colors.grey200,
    containedTextBackground: Colors.grey200,
};

export const kDefaultDarkFormColors: RequiredFormColors = {
    label: Colors.grey100,
    input: Colors.blue400,
    error: Colors.red300,
    disabled: Colors.grey300,
    destructive: Colors.red300,
    buttonForeground: Colors.black,
    buttonBackground: Colors.blue400,
    sectionTitle: Colors.grey300,
    sectionFooter: Colors.grey300,
    divider: Colors.grey800,
    containedTextBackground: Colors.grey800,
};

export const kDefaultFormStyle: Required<FormStyle> = {
    sectionMargin: 10,
    roundness: 8,
    rowHeight: 52,
    fieldHeight: 0,
    fontSize: 16,
    errorFontSize: 14,
    fontWeight: 'normal',
    inputFontWeight: 'normal',
    sectionTitleAlign: 'auto',
    sectionFooterAlign: 'auto',

    colors: kDefaultLightFormColors,

    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 0,
    paddingBottom: 0,
    marginLeft: 6,
    marginRight: 6,
    marginTop: 8,
    marginBottom: 8,
};
