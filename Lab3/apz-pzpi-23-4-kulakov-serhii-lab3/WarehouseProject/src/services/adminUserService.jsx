const API_URL = 'https://localhost:7234/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const adminUserService = {
    async getAllUsers() {
        try {
            const response = await fetch(`${API_URL}/admin/users`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Не вдалося отримати список користувачів');
            }

            return await response.json();
        } catch (error) {
            console.error('Помилка отримання користувачів:', error);
            throw error;
        }
    },

    async blockUser(userId) {
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/block`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Не вдалося заблокувати користувача');
            }

            return await response.json();
        } catch (error) {
            console.error('Помилка блокування користувача:', error);
            throw error;
        }
    },

    async unblockUser(userId) {
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/unblock`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Не вдалося розблокувати користувача');
            }

            return await response.json();
        } catch (error) {
            console.error('Помилка розблокування користувача:', error);
            throw error;
        }
    },

    async getUserAdverts(userId) {
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/adverts`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Не вдалося отримати оголошення користувача');
            }

            return await response.json();
        } catch (error) {
            console.error('Помилка отримання оголошень:', error);
            throw error;
        }
    }
};