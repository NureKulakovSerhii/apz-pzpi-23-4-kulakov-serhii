const API_URL = 'https://localhost:7234/api';

export const settingsService = {
    exportSettings() {
        const settings = {
            theme: localStorage.getItem('theme') || 'light',
            language: localStorage.getItem('language') || 'uk',
            timezone: localStorage.getItem('timezone') || 'Europe/Kyiv',
            dateFormat: localStorage.getItem('dateFormat') || 'DD.MM.YYYY',
            exportedAt: new Date().toISOString()
        };
        
        const json = JSON.stringify(settings, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `settings_${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
    importSettings(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const settings = JSON.parse(e.target.result);
                    
                    if (settings.theme) {
                        localStorage.setItem('theme', settings.theme);
                        document.documentElement.setAttribute('data-theme', settings.theme);
                    }
                    if (settings.language) {
                        localStorage.setItem('language', settings.language);
                        document.documentElement.setAttribute('lang', settings.language);
                        window.location.reload(); 
                    }
                    if (settings.timezone) {
                        localStorage.setItem('timezone', settings.timezone);
                    }
                    if (settings.dateFormat) {
                        localStorage.setItem('dateFormat', settings.dateFormat);
                    }
                    
                    resolve(settings);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
};