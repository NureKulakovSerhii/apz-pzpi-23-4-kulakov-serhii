import { createContext, useContext, useState, useEffect } from 'react';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'uk';
    });

    useEffect(() => {
        document.documentElement.setAttribute('lang', language);
        localStorage.setItem('language', language);
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
}
const RegionContext = createContext(null);

export const TIMEZONES = {
    'Europe/Kyiv': 'Київ (UTC+2/UTC+3)',
    'Europe/London': 'London (UTC+0/UTC+1)',
    'Europe/Berlin': 'Berlin (UTC+1/UTC+2)',
    'America/New_York': 'New York (UTC-5/UTC-4)',
    'Asia/Tokyo': 'Tokyo (UTC+9)'
};

export const DATE_FORMATS = {
    'DD.MM.YYYY': 'dd.mm.yyyy',
    'MM/DD/YYYY': 'mm/dd/yyyy',
    'YYYY-MM-DD': 'yyyy-mm-dd',
    'DD/MM/YYYY': 'dd/mm/yyyy'
};

export function RegionProvider({ children }) {
    const [timezone, setTimezone] = useState(() => {
        return localStorage.getItem('timezone') || 'Europe/Kyiv';
    });
    
    const [dateFormat, setDateFormat] = useState(() => {
        return localStorage.getItem('dateFormat') || 'DD.MM.YYYY';
    });

    useEffect(() => {
        localStorage.setItem('timezone', timezone);
    }, [timezone]);

    useEffect(() => {
        localStorage.setItem('dateFormat', dateFormat);
    }, [dateFormat]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        
        const options = {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        
        let formattedDate = date.toLocaleDateString('uk-UA', options);
        const [day, month, year] = formattedDate.split('.');
        
        switch(dateFormat) {
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            default:
                return `${day}.${month}.${year}`;
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        
        const options = {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        let formatted = date.toLocaleString('uk-UA', options);
        const parts = formatted.split(', ');
        if (parts.length === 2) {
            const [day, month, year] = parts[0].split('.');
            let datePart = `${day}.${month}.${year}`;
            
            switch(dateFormat) {
                case 'MM/DD/YYYY':
                    datePart = `${month}/${day}/${year}`;
                    break;
                case 'YYYY-MM-DD':
                    datePart = `${year}-${month}-${day}`;
                    break;
                case 'DD/MM/YYYY':
                    datePart = `${day}/${month}/${year}`;
                    break;
            }
            return `${datePart} ${parts[1]}`;
        }
        return formatted;
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleTimeString('uk-UA', options);
    };

    const getCurrentTime = () => {
        const now = new Date();
        const options = {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        return now.toLocaleTimeString('uk-UA', options);
    };

    const getCurrentDate = () => {
        const now = new Date();
        return formatDate(now.toISOString());
    };

    return (
        <RegionContext.Provider value={{
            timezone,
            setTimezone,
            dateFormat,
            setDateFormat,
            formatDate,
            formatDateTime,
            formatTime,
            getCurrentTime,
            getCurrentDate,
            TIMEZONES,
            DATE_FORMATS
        }}>
            {children}
        </RegionContext.Provider>
    );
}

export function useRegion() {
    const ctx = useContext(RegionContext);
    if (!ctx) throw new Error('useRegion must be used within RegionProvider');
    return ctx;
}