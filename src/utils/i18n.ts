import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {i18nTranslationEn} from "./i18nTranslationEn.ts";
import {i18nTranslationRu} from "./i18nTranslationRu.ts";

const resources = {
    en: {translation: i18nTranslationEn},
    ru: {translation: i18nTranslationRu},
};

// @ts-ignore
const userLanguage = navigator.language || navigator.userLanguage;
const defaultLanguage = userLanguage.startsWith('ru') ? 'ru' : 'en';

i18n.use(initReactI18next).init({
    resources,
    lng: defaultLanguage,
    interpolation: {
        escapeValue: false
    }
}).then();

export default i18n;
