import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

const savedLanguage = localStorage.getItem('i18nLanguage');
const browserLanguage = navigator.language.split('-')[0];
const defaultLanguage = savedLanguage || (browserLanguage === 'ru' ? 'ru' : 'en');

i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
        lng: defaultLanguage,
        fallbackLng: ['en', 'ru'],

        ns: ['main'],
        defaultNS: 'main',

        backend: {
            loadPath: '/dashboard/locales/{{lng}}/{{ns}}.json'
        },

        interpolation: {
            escapeValue: false
        },

        react: {
            useSuspense: false
        }
    });

i18n.on('languageChanged', (lng) => {
    localStorage.setItem('i18nLanguage', lng);
});

export default i18n;