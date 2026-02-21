import ko from './ko.json';
import en from './en.json';

export type Locale = 'ko' | 'en';
export const translations = { ko, en } as const;
export type TranslationKey = keyof typeof ko;

export function getTranslations(locale: Locale) {
  return translations[locale];
}

export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'ko';
  return navigator.language.startsWith('en') ? 'en' : 'ko';
}
