const API_URL = 'https://localhost:7234/api';

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/Auth/login-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                UserEmail: email.trim(),
                UserPassword: password
            })
        });

        const contentType = response.headers.get('content-type');
        if (!response.ok) {
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Помилка входу');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Помилка входу');
            }
        }

        const data = await response.json();
        return data; 
    } catch (error) {
        console.error('Помилка при вході: ', error);
        throw error;
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/Auth/register-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Помилка реєстрації');
            }
            throw new Error('Помилка реєстрації');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Помилка при реєстрації:', error);
        throw error;
    }
};

export const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    if (!token || token === 'undefined' || token === 'null') {
        return false;
    }
    return true;
};

export const getToken = () => {
    return localStorage.getItem('access_token');
};