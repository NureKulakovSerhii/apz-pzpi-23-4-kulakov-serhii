export const BUILDING_TYPE_VALUES = {
    'box': 0,
    'hangar': 1,
    'officeWarehouse': 2,
    'industrialWarehouse': 3,
    'terminal': 4,
    'refrigeratedWarehouse': 5
};

export const CITY_VALUES = {
    'kyiv': 0,
    'odesa': 1,
    'lviv': 2,
    'kharkiv': 3,
    'dnipro': 4,
    'zaporizhzhia': 5,
    'vinnytsia': 6,
    'zhytomyr': 7,
    'chernihiv': 8
};

export const COMMUNICATIONS_VALUES = {
    'electricity': 0,
    'waterSupply': 1,
    'sewerage': 2,
    'heating': 3,
    'ventilation': 4,
    'internet': 5
};

export const APPLIANCES_VALUES = {
    'airConditioner': 0,
    'securitySystem': 1,
    'surveillance': 2,
    'fireExtinguishers': 3
};

export const INFRASTRUCTURE_VALUES = {
    'parking': 0,
    'freightElevator': 1,
    'ramp': 2,
    'security': 3,
    'showers': 4,
    'canteen': 5
};

export const getBuildingTypeMap = (t) => {
    if (!t?.createAdvert?.buildingTypes) {
        return {
            'Бокс': 0,
            'Ангар': 1,
            'Офісний склад': 2,
            'Промисловий склад': 3,
            'Термінал': 4,
            'Охолоджуваний склад': 5
        };
    }
    return {
        [t.createAdvert.buildingTypes.box]: 0,
        [t.createAdvert.buildingTypes.hangar]: 1,
        [t.createAdvert.buildingTypes.officeWarehouse]: 2,
        [t.createAdvert.buildingTypes.industrialWarehouse]: 3,
        [t.createAdvert.buildingTypes.terminal]: 4,
        [t.createAdvert.buildingTypes.refrigeratedWarehouse]: 5
    };
};

export const getCityMap = (t) => {
    if (!t?.createAdvert?.cities) {
        return {
            'Київ': 0,
            'Одеса': 1,
            'Львів': 2,
            'Харків': 3,
            'Дніпро': 4,
            'Запоріжжя': 5,
            'Вінниця': 6,
            'Житомир': 7,
            'Чернігів': 8
        };
    }
    return {
        [t.createAdvert.cities.kyiv]: 0,
        [t.createAdvert.cities.odesa]: 1,
        [t.createAdvert.cities.lviv]: 2,
        [t.createAdvert.cities.kharkiv]: 3,
        [t.createAdvert.cities.dnipro]: 4,
        [t.createAdvert.cities.zaporizhzhia]: 5,
        [t.createAdvert.cities.vinnytsia]: 6,
        [t.createAdvert.cities.zhytomyr]: 7,
        [t.createAdvert.cities.chernihiv]: 8
    };
};

export const getCommunicationsMap = (t) => {
    if (!t?.createAdvert?.communicationOptions) {
        return {
            'Електрика': 0,
            'Водопостачання': 1,
            'Каналізація': 2,
            'Опалення': 3,
            'Вентиляція': 4,
            'Інтернет': 5
        };
    }
    return {
        [t.createAdvert.communicationOptions.electricity]: 0,
        [t.createAdvert.communicationOptions.waterSupply]: 1,
        [t.createAdvert.communicationOptions.sewerage]: 2,
        [t.createAdvert.communicationOptions.heating]: 3,
        [t.createAdvert.communicationOptions.ventilation]: 4,
        [t.createAdvert.communicationOptions.internet]: 5
    };
};

export const getAppliancesMap = (t) => {
    if (!t?.createAdvert?.applianceOptions) {
        return {
            'Кондиціонер': 0,
            'Охоронна система': 1,
            'Відеоспостереження': 2,
            'Вогнегасники': 3
        };
    }
    return {
        [t.createAdvert.applianceOptions.airConditioner]: 0,
        [t.createAdvert.applianceOptions.securitySystem]: 1,
        [t.createAdvert.applianceOptions.surveillance]: 2,
        [t.createAdvert.applianceOptions.fireExtinguishers]: 3
    };
};

export const getInfrastructureMap = (t) => {
    if (!t?.createAdvert?.infrastructureOptions) {
        return {
            'Парковка': 0,
            'Вантажний ліфт': 1,
            'Рампа': 2,
            'Охорона': 3,
            'Душові': 4,
            'Їдальня': 5
        };
    }
    return {
        [t.createAdvert.infrastructureOptions.parking]: 0,
        [t.createAdvert.infrastructureOptions.freightElevator]: 1,
        [t.createAdvert.infrastructureOptions.ramp]: 2,
        [t.createAdvert.infrastructureOptions.security]: 3,
        [t.createAdvert.infrastructureOptions.showers]: 4,
        [t.createAdvert.infrastructureOptions.canteen]: 5
    };
};

export const getReverseBuildingTypeMap = (t) => {
    const map = getBuildingTypeMap(t);
    return Object.fromEntries(Object.entries(map).map(([key, value]) => [value, key]));
};

export const getReverseCityMap = (t) => {
    const map = getCityMap(t);
    return Object.fromEntries(Object.entries(map).map(([key, value]) => [value, key]));
};

export const getReverseCommunicationsMap = (t) => {
    const map = getCommunicationsMap(t);
    return Object.fromEntries(Object.entries(map).map(([key, value]) => [value, key]));
};

export const getReverseAppliancesMap = (t) => {
    const map = getAppliancesMap(t);
    return Object.fromEntries(Object.entries(map).map(([key, value]) => [value, key]));
};

export const getReverseInfrastructureMap = (t) => {
    const map = getInfrastructureMap(t);
    return Object.fromEntries(Object.entries(map).map(([key, value]) => [value, key]));
};