const API_URL = 'https://localhost:7234';

export const searchAdverts = async (filters) => {
    try {
        console.log('Фільтри для пошуку (RAW):', filters);
        const url = new URL(`${API_URL}/api/Advert/search`);
    
        const fieldMapping = {
            priceFrom: 'pricePerMonthMin',
            priceTo: 'pricePerMonthMax',
            
            areaFrom: 'minScale', 
            areaTo: 'maxScale',
        
            floorFrom: 'minFloor',
            floorTo: 'maxFloor',
        
            buildingType: 'BuildingType',
            city: 'City',
            communications: 'Communications',
            appliances: 'HouseholdAppliances',
            infrastructure: 'Infrastructures',
            sortBy: 'sortBy', 
            withPhoto: 'withPhoto',
            page: 'page',
            pageSize: 'pageSize'
        };
        
        Object.keys(filters).forEach(ourField => {
            const backendField = fieldMapping[ourField] || ourField;
            const value = filters[ourField];
            
            if (value === '' || value === null || value === undefined) {
                return;
            }
            
            if (Array.isArray(value)) {
                const filteredArray = value.filter(item => 
                    item !== '' && item !== null && item !== undefined
                );
                
                if (filteredArray.length > 0) {
                    filteredArray.forEach(item => {
                        url.searchParams.append(backendField, item.toString());
                    });
                }
            }
            else if (typeof value === 'boolean' && value) {
                url.searchParams.append(backendField, 'true');
            }
            else if (typeof value === 'number') {
                url.searchParams.append(backendField, value.toString());
            }
            else if (typeof value === 'string' && value.trim() !== '') {
                url.searchParams.append(backendField, value);
            }
        });
        
        console.log('URL запиту:', url.toString());
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Помилка відповіді:', errorText);
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.title || `Помилка пошуку: ${response.status}`);
            } catch {
                throw new Error(`Помилка пошуку: ${response.status}`);
            }
        }

        return await response.json();
    } catch (error) {
        console.error("Помилка в searchAdverts", error);
        throw error;
    }
};