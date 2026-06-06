const API_URL = 'https://localhost:7234/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const statisticsService = {
    async getStatistics() {
        try {
            const response = await fetch(`${API_URL}/Statistic`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Не вдалося отримати статистику');
            }

            return await response.json();
        } catch (error) {
            console.error('Помилка отримання статистики:', error);
            throw error;
        }
    },

    async exportStatistics() {
        try {
            const response = await fetch(`${API_URL}/Statistic/export`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Не вдалося експортувати статистику');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || `statistics_${new Date().toISOString()}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Помилка експорту статистики:', error);
            throw error;
        }
    },

    async exportUsers() {
        try {
            const response = await fetch(`${API_URL}/Statistic/users`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Не вдалося експортувати користувачів');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || `users_${new Date().toISOString()}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Помилка експорту користувачів:', error);
            throw error;
        }
    },

    async exportAdverts() {
        try {
            const response = await fetch(`${API_URL}/Statistic/adverts`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Не вдалося експортувати оголошення');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || `adverts_${new Date().toISOString()}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Помилка експорту оголошень:', error);
            throw error;
        }
    }
};