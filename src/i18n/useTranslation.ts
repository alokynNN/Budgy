import { useStore } from '../store/useStore'
import en from './locales/en'
import sr from './locales/sr'

const builtinTranslations: { [key: string]: typeof en } = { en, sr }

export const useTranslation = () => {
  const language = useStore((state) => state.language)
  const customLanguages = useStore((state) => state.customLanguages)

  const allTranslations: Record<string, unknown> = {
    ...builtinTranslations,
    ...Object.fromEntries(customLanguages.map(l => [l.code, l.translations])),
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: unknown = allTranslations[language] ?? allTranslations['en']
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k]
    }
    // fallback to English if missing in current lang
    if (value === undefined || value === null) {
      value = allTranslations['en']
      for (const k of keys) {
        value = (value as Record<string, unknown>)?.[k]
      }
    }
    return (typeof value === 'string' ? value : key)
  }

  return { t, language }
}

export const useAvailableLanguages = () => {
  const customLanguages = useStore((state) => state.customLanguages)
  return [
    { code: 'en', name: 'English', isBuiltin: true },
    { code: 'sr', name: 'Srpski', isBuiltin: true },
    ...customLanguages.map(l => ({ code: l.code, name: l.name, isBuiltin: false })),
  ]
}

// Legacy — kept for compatibility
export const getAvailableLanguages = () => [
  { code: 'en', name: 'English' },
  { code: 'sr', name: 'Srpski' },
]

// Build a downloadable JSON template from the English locale
export const buildLanguageTemplate = (): string => {
  const template = {
    name: 'Your Language Name',
    code: 'xx',
    ...en,
  }
  return JSON.stringify(template, null, 2)
}