import { useLanguage } from '../context/AppContext';
import { uk } from '../locales/uk';
import { en } from '../locales/en';

const translations = { uk, en };

export function useTranslation() {
    const { language } = useLanguage();
    const t = translations[language] || translations.uk;
    const formatDate = (dateString, options = {}) => {
        if (!dateString) return t.profile.noDate;
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return t.profile.noDate;

            const locale = language === 'uk' ? 'uk-UA' : 'en-GB';
            return date.toLocaleDateString(locale, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                ...options,
            });
        } catch {
            return t.profile.noDate;
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return t.profile.noDate;
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return t.profile.noDate;

            const locale = language === 'uk' ? 'uk-UA' : 'en-GB';
            return date.toLocaleString(locale, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return t.profile.noDate;
        }
    };

    return { t, language, formatDate, formatDateTime };
}