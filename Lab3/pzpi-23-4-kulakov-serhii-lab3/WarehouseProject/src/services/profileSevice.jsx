import { getAuthHeaders } from "./advertService";
const API_URL = 'https://localhost:7234';

export const getUserProfile = async () => {
        const response = await fetch(`${API_URL}/api/Profile/get-my-user-profile`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(errorText);
            
            if (response.status === 401) {
                localStorage.removeItem('access_token'); 
                window.location.href = '/login'; 
                throw new Error('Authorize first');
            }
            
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message);
            } catch {
                throw new Error(errorText);
            }
        }
        
        const data = await response.json();
    return data;
};

export const updateUserProfile = async (profileData) => {
    try {
        const updateData = {
            name: profileData.name || '',
            surname: profileData.surname || '',
            phoneNumber: profileData.phoneNumber || '',
            secondNumber: profileData.secondPhoneNumber || '' 
        };
        const response = await fetch(`${API_URL}/api/Profile/update-profile`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(updateData),
        });
        
        if (!response.ok) {
            const errorText = await response.text(); 
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message || errorJson.title || `Помилка: ${response.status}`);
            } catch {
                throw new Error(errorText || 'Помилка оновлення профілю');
            }
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Помилка в updateUserProfile', error);
        throw error;
    }
};


export const updateAdvert = async (advertId, updateData) => {
    try {
        const response = await fetch(`${API_URL}/api/Advert/${advertId}/update-advert`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updateData),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message || errorJson.title || `Помилка: ${response.status}`);
            } catch {
                throw new Error(errorText || 'Не вдалося оновити оголошення');
            }
        }
        if (response.status === 204) {
            return { success: true };
        }
        
        try {
            const data = await response.json();
            return data;
        } catch {
            return { success: true };
        }
    } catch (error) {
        console.error('Помилка оновлення оголошення:', error);
        throw error;
    }
};
export const deleteAdvert = async (advertId) => {
    try {
        const response = await fetch(`${API_URL}/api/Advert/${advertId}/delete-advert`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message || `Помилка: ${response.status}`);
            } catch {
                throw new Error(errorText || 'Не вдалося видалити оголошення');
            }
        }
        return { success: true, message: 'Оголошення успішно видалено' };
    } catch (error) {
        console.error('Помилка видалення оголошення:', error);
        throw error;
    }
};
export const getAdvertById = async (advertId) => {
    try {
        const response = await fetch(`${API_URL}/api/Advert/${advertId}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message || `Помилка: ${response.status}`);
            } catch {
                throw new Error(errorText || 'Не вдалося завантажити оголошення');
            }
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Помилка отримання оголошення:', error);
        throw error;
    }
};