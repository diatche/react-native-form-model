import i18n from 'i18n-js';

export interface FormTranslationProps {
    today: undefined;
    cancel: undefined;
    done: undefined;
    invalidValue: undefined;
    valueMustBeGTE: { value: number };
    valueMustBeGT: { value: number };
    valueMustBeLTE: { value: number };
    valueMustBeLT: { value: number };
    invalidTime: undefined;
    missingDate: undefined;
    dateMustBeInPast: undefined;
}
export type FormTranslationKey = keyof FormTranslationProps;

export function lz<K extends FormTranslationKey>(
    key: K,
    options?: i18n.TranslateOptions & FormTranslationProps[K]
): string {
    return i18n.t(key, options);
}

export function getCurrentLocale() {
    return i18n.locale;
}
