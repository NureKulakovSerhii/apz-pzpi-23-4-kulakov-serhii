import { 
    getBuildingTypeMap,
    getCityMap,
    getCommunicationsMap,
    getAppliancesMap,
    getInfrastructureMap
} from "../constants/mapping";

const API_URL = 'https://localhost:7234';

const getAuthToken = () => {
    return localStorage.getItem('access_token');
};

export const getAuthHeaders = () => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const handleApiError = async (response) => {
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Помилка сервера';
        
        try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.title || errorText;
        } catch {
            errorMessage = errorText || `Помилка ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
    }
    
    return response;
};

export const getAllAdverts = async () => {
    try {
        const response = await fetch(`${API_URL}/api/Advert/all-adverts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Помилка при завантаженні оголошень');
        }
        return await response.json();
    } catch (error) {
        console.error("Помилка в getAllAdverts", error);
        throw error;
    }
};

export const addToFavorites = async (advertId) => {
    try {
        const response = await fetch(`${API_URL}/api/Advert/${advertId}/add-to-favorites`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error adding to favs', errorText);
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message);
            } catch {
                throw new Error(errorText);
            }
        }
        return await response.json();
    } catch (error) {
        console.error('Помилка в addToFavorites', error);
        throw error;
    }
};

export const removeFromFavorites = async (advertId) => {
    try {
        const response = await fetch(`${API_URL}/api/Advert/${advertId}/delete-from-favorites`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error removing from favs', errorText);
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message);
            } catch {
                throw new Error(errorText || 'Помилка видалення з обраних');
            }
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getFavorites = async () => {
    try {
        const response = await fetch(`${API_URL}/api/Advert/get-favorites`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(errorText);
            if (response.status === 401) {
                console.log('Користувач не авторизований');
                return [];
            }
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message);
            } catch {
                throw new Error(errorText);
            }
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getAdvertById = async (advertId) => {
    try {
        console.log('Отримуємо оголошення за ID:', advertId);
        
        const url = new URL(`${API_URL}/api/Advert/get-advert`);
        url.searchParams.append('advertId', advertId);
        
        console.log('URL запиту:', url.toString());
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Помилка отримання оголошення:', errorText);
            
            if (response.status === 404) {
                throw new Error('Оголошення не знайдено');
            }
            
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message || errorJson.title || `Помилка: ${response.status}`);
            } catch {
                throw new Error(errorText || 'Помилка завантаження оголошення');
            }
        }
        
        const data = await response.json();
        console.log('Отримані дані оголошення:', data);
        return data;
        
    } catch (error) {
        console.error('Помилка в getAdvertById', error);
        throw error;
    }
};

const getBuildingTypeValue = (buildingType, t) => {
    const map = getBuildingTypeMap(t);
    return map[buildingType] ?? 0;
};

const getCityValue = (city, t) => {
    const map = getCityMap(t);
    return map[city] ?? 0;
};

const getCommunicationsValues = (communications, t) => {
    const map = getCommunicationsMap(t);
    return communications.map(comm => map[comm]).filter(v => v !== undefined);
};

const getAppliancesValues = (appliances, t) => {
    const map = getAppliancesMap(t);
    return appliances.map(app => map[app]).filter(v => v !== undefined);
};

const getInfrastructureValues = (infrastructure, t) => {
    const map = getInfrastructureMap(t);
    return infrastructure.map(inf => map[inf]).filter(v => v !== undefined);
};

export const createAdvert = async (advertData, photos = [], t) => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('Користувач не авторизований');
        }

        console.log('Дані перед відправкою:', advertData);
        
        const formData = new FormData();

        formData.append('Title', advertData.title);
        formData.append('Description', advertData.description);
        
        formData.append('WarehouseDto.Address', advertData.address);
        formData.append('WarehouseDto.PricePerMonth', advertData.price.toString());
        formData.append('WarehouseDto.Scale', advertData.area.toString());
        formData.append('WarehouseDto.Floor', advertData.floor ? advertData.floor.toString() : '0');
        formData.append('WarehouseDto.BuildingType', getBuildingTypeValue(advertData.buildingType, t).toString());
        formData.append('WarehouseDto.City', getCityValue(advertData.city, t).toString());

        const communicationsValues = getCommunicationsValues(advertData.communications || [], t);
        if (communicationsValues.length > 0) {
            communicationsValues.forEach(commValue => {
                formData.append('WarehouseDto.Communications', commValue.toString());
            });
        } else {
            formData.append('WarehouseDto.Communications', '0');
        }

        const appliancesValues = getAppliancesValues(advertData.appliances || [], t);
        if (appliancesValues.length > 0) {
            appliancesValues.forEach(appValue => {
                formData.append('WarehouseDto.HouseholdAppliances', appValue.toString());
            });
        } else {
            formData.append('WarehouseDto.HouseholdAppliances', '0');
        }

        const infrastructureValues = getInfrastructureValues(advertData.infrastructure || [], t);
        if (infrastructureValues.length > 0) {
            infrastructureValues.forEach(infraValue => {
                formData.append('WarehouseDto.Infrastructures', infraValue.toString());
            });
        } else {
            formData.append('WarehouseDto.Infrastructures', '0');
        }

        if (photos && photos.length > 0) {
            formData.append('WarehouseDto.ImageFile', photos[0]);
        }

        console.log('Відправляємо FormData:');
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }

        const response = await fetch(`${API_URL}/api/Advert/create-advert`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
            credentials: 'include'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Помилка відповіді:', errorText);
            console.error('Статус помилки:', response.status);
            
            if (errorText.includes('The Address field is required')) {
                throw new Error('Поле адреси обов\'язкове для заповнення');
            } else if (errorText.includes('Address')) {
                throw new Error('Помилка в полі адреси: ' + errorText);
            }
            
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message || errorJson.title || `Помилка: ${response.status}`);
            } catch {
                throw new Error(errorText || `Помилка створення оголошення (статус: ${response.status})`);
            }
        }

        const result = await response.json();
        console.log('Успішна відповідь:', result);
        return result;
        
    } catch (error) {
        console.error('Помилка в createAdvert:', error);
        throw error;
    }
};

export const getInactiveAdverts = async () => {
    try {
        const response = await fetch(`${API_URL}/api/Advert/inactive-adverts`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Помилка отримання неактивних оголошень:', errorText);
            
            if (response.status === 401 || response.status === 403) {
                throw new Error('Немає доступу до цієї функції');
            }
            
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message || 'Помилка завантаження оголошень');
            } catch {
                throw new Error(errorText || 'Не вдалося завантажити оголошення');
            }
        }

        return await response.json();
    } catch (error) {
        console.error('Помилка в getInactiveAdverts:', error);
        throw error;
    }
};

export const activateAdvert = async (advertId) => {
    try {
        const response = await fetch(`${API_URL}/api/Advert/${advertId}/activate-advert`, {
            method: 'PUT',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Помилка активації оголошення:', errorText);
            
            if (response.status === 401 || response.status === 403) {
                throw new Error('Немає доступу до цієї функції');
            }
            
            if (response.status === 404) {
                throw new Error('Оголошення не знайдено');
            }
            
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message || 'Помилка активації оголошення');
            } catch {
                throw new Error(errorText || 'Не вдалося активувати оголошення');
            }
        }

        const contentLength = response.headers.get('Content-Length');
        if (contentLength && parseInt(contentLength) > 0) {
            return await response.json();
        }
        

        return { success: true, message: 'Оголошення успішно активовано' };
        
    } catch (error) {
        console.error('Помилка в activateAdvert:', error);
        throw error;
    }
};

export const deleteAdvert = async (advertId) => {
    try {
        const url = `${API_URL}/api/Advert/${advertId}/delete-advert`;
        console.log('FULL URL:', url);
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Помилка видалення оголошення:', errorText);
            
            if (response.status === 401 || response.status === 403) {
                throw new Error('Немає доступу до цієї функції');
            }
            
            if (response.status === 404) {
                throw new Error('Оголошення не знайдено');
            }
            
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message || 'Помилка видалення оголошення');
            } catch {
                throw new Error(errorText || 'Не вдалося видалити оголошення');
            }
        }
    
        if (response.status === 204) {
            return { success: true, message: 'Оголошення успішно видалено' };
        }
        
        const contentLength = response.headers.get('Content-Length');
        if (contentLength && parseInt(contentLength) > 0) {
            return await response.json();
        }
        
        return { success: true, message: 'Оголошення успішно видалено' };
        
    } catch (error) {
        console.error('Помилка в deleteAdvert:', error);
        throw error;
    }
};