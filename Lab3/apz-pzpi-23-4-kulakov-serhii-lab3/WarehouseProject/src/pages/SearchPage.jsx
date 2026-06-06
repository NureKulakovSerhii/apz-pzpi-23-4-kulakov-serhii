import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import AdvertCard from "../components/AdvertCard";
import '../styles/Search.css';
import { searchAdverts } from '../services/searchService';
import { 
    getBuildingTypeMap,
    getCityMap,
    getCommunicationsMap,
    getAppliancesMap,
    getInfrastructureMap,
    getReverseBuildingTypeMap,
    getReverseCityMap,
    getReverseCommunicationsMap,
    getReverseAppliancesMap,
    getReverseInfrastructureMap
} from "../constants/mapping";
import { useTranslation } from '../hooks/useTranslation';

function SearchPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [maps, setMaps] = useState({
        BUILDING_TYPE_MAP: {},
        CITY_MAP: {},
        COMMUNICATIONS_MAP: {},
        APPLIANCES_MAP: {},
        INFRASTRUCTURE_MAP: {},
        REVERSE_BUILDING_TYPE_MAP: {},
        REVERSE_CITY_MAP: {},
        REVERSE_COMMUNICATIONS_MAP: {},
        REVERSE_APPLIANCES_MAP: {},
        REVERSE_INFRASTRUCTURE_MAP: {}
    });
    
    useEffect(() => {
        setMaps({
            BUILDING_TYPE_MAP: getBuildingTypeMap(t),
            CITY_MAP: getCityMap(t),
            COMMUNICATIONS_MAP: getCommunicationsMap(t),
            APPLIANCES_MAP: getAppliancesMap(t),
            INFRASTRUCTURE_MAP: getInfrastructureMap(t),
            REVERSE_BUILDING_TYPE_MAP: getReverseBuildingTypeMap(t),
            REVERSE_CITY_MAP: getReverseCityMap(t),
            REVERSE_COMMUNICATIONS_MAP: getReverseCommunicationsMap(t),
            REVERSE_APPLIANCES_MAP: getReverseAppliancesMap(t),
            REVERSE_INFRASTRUCTURE_MAP: getReverseInfrastructureMap(t)
        });
    }, [t]);
    
    const {
        BUILDING_TYPE_MAP,
        CITY_MAP,
        COMMUNICATIONS_MAP,
        APPLIANCES_MAP,
        INFRASTRUCTURE_MAP,
        REVERSE_BUILDING_TYPE_MAP,
        REVERSE_CITY_MAP,
        REVERSE_COMMUNICATIONS_MAP,
        REVERSE_APPLIANCES_MAP,
        REVERSE_INFRASTRUCTURE_MAP
    } = maps;
    
    const buildingTypes = Object.entries(BUILDING_TYPE_MAP).map(([label, value]) => ({
        label,
        value: value.toString()
    }));

    const cities = Object.entries(CITY_MAP).map(([label, value]) => ({
        label,
        value: value.toString()
    }));

    const communications = Object.entries(COMMUNICATIONS_MAP).map(([label, value]) => ({
        label,
        value: value.toString()
    }));

    const appliances = Object.entries(APPLIANCES_MAP).map(([label, value]) => ({
        label,
        value: value.toString()
    }));

    const infrastructure = Object.entries(INFRASTRUCTURE_MAP).map(([label, value]) => ({
        label,
        value: value.toString()
    }));

    const SORTING_OPTIONS = [
        { value: '', label: t.search.sorting.default },
        { value: '0', label: t.search.sorting.none },
        { value: '1', label: t.search.sorting.priceAsc },
        { value: '2', label: t.search.sorting.priceDesc },
        { value: '3', label: t.search.sorting.areaAsc },
        { value: '4', label: t.search.sorting.areaDesc },
        { value: '5', label: t.search.sorting.floorAsc },
        { value: '6', label: t.search.sorting.floorDesc }
    ];

    const [filters, setFilters] = useState({
        priceFrom: '',
        priceTo: '',
        floorFrom: '',
        floorTo: '',
        areaFrom: '',
        areaTo: '',
        buildingType: '',
        communications: [],
        city: '',
        appliances: [],
        infrastructure: [],
        sortBy: '',
        page: 1,
        pageSize: 10
    });

    const [adverts, setAdverts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleMultiSelectChange = (field, value) => {
        setFilters(prev => {
            const currentValues = prev[field] || [];
            const numericValue = parseInt(value.toString());
            if (isNaN(numericValue)) return prev;
            const isSelected = currentValues.includes(numericValue);
            if (isSelected) {
                return { ...prev, [field]: currentValues.filter(v => v !== numericValue) };
            } else {
                return { ...prev, [field]: [...currentValues, numericValue] };
            }
        });
    };

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const newFilters = { ...filters, page: 1 };
            const apiFilters = { page: newFilters.page, pageSize: newFilters.pageSize };
            
            if (newFilters.priceFrom) apiFilters.pricePerMonthMin = parseInt(newFilters.priceFrom);
            if (newFilters.priceTo) apiFilters.pricePerMonthMax = parseInt(newFilters.priceTo);
            if (newFilters.floorFrom) apiFilters.minFloor = parseInt(newFilters.floorFrom);
            if (newFilters.floorTo) apiFilters.maxFloor = parseInt(newFilters.floorTo);
            if (newFilters.areaFrom) apiFilters.minScale = parseInt(newFilters.areaFrom);
            if (newFilters.areaTo) apiFilters.maxScale = parseInt(newFilters.areaTo);
            if (newFilters.buildingType) apiFilters.BuildingType = parseInt(newFilters.buildingType);
            if (newFilters.city) apiFilters.City = parseInt(newFilters.city);
            if (newFilters.sortBy) apiFilters.sortBy = parseInt(newFilters.sortBy);
            if (newFilters.communications.length > 0) apiFilters.Communications = newFilters.communications.filter(v => v !== '' && v !== null);
            if (newFilters.appliances.length > 0) apiFilters.HouseholdAppliances = newFilters.appliances.filter(v => v !== '' && v !== null);
            if (newFilters.infrastructure.length > 0) apiFilters.Infrastructures = newFilters.infrastructure.filter(v => v !== '' && v !== null);

            const data = await searchAdverts(apiFilters);
            const transformedAdverts = data.map(advert => ({
                id: advert.id,
                title: advert.title,
                details: advert.description,
                address: advert.warehouse.address,
                scale: advert.warehouse.scale,
                price: advert.warehouse.pricePerMonth,
                floor: advert.warehouse.floor,
                buildingType: REVERSE_BUILDING_TYPE_MAP[advert.warehouse.buildingType] || t.search.unknownType,
                city: REVERSE_CITY_MAP[advert.warehouse.city] || t.search.unknownCity,
                url: advert.warehouse.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
                createdAt: advert.createdAt,
                isActive: advert.isActive,
                author: advert.author
            }));
            
            setAdverts(transformedAdverts);
            setTotalCount(transformedAdverts.length);
            
            const params = new URLSearchParams();
            Object.keys(apiFilters).forEach(key => {
                const value = apiFilters[key];
                if (Array.isArray(value) && value.length > 0) {
                    value.forEach(item => params.append(key, item.toString()));
                } else if (value !== '' && value !== false) {
                    params.append(key, value.toString());
                }
            });
            setSearchParams(params);
            
        } catch (error) {
            console.error('Search error:', error);
            setError(t.search.loadError);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        const resetFilters = {
            priceFrom: '', priceTo: '',
            floorFrom: '', floorTo: '',
            areaFrom: '', areaTo: '',
            buildingType: '',
            communications: [],
            city: '',
            appliances: [],
            infrastructure: [],
            sortBy: '',
            page: 1,
            pageSize: 10
        };
        setFilters(resetFilters);
        setSearchParams(new URLSearchParams());
        handleSearch();
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            const params = Object.fromEntries(searchParams.entries());
            
            if (Object.keys(params).length > 0) {
                const updatedFilters = { ...filters };
                Object.keys(params).forEach(key => {
                    if (key in updatedFilters) {
                        if (['communications', 'appliances', 'infrastructure'].includes(key)) {
                            const values = searchParams.getAll(key);
                            updatedFilters[key] = values.length > 0 ? values.map(v => parseInt(v)).filter(v => !isNaN(v)) : [];
                        } else if (['page', 'pageSize'].includes(key)) {
                            updatedFilters[key] = parseInt(params[key]) || '';
                        } else if (['priceFrom', 'priceTo', 'floorFrom', 'floorTo', 'areaFrom', 'areaTo', 'buildingType', 'city', 'sortBy'].includes(key)) {
                            updatedFilters[key] = params[key] ? parseInt(params[key]) : '';
                        } else {
                            updatedFilters[key] = params[key];
                        }
                    }
                });
                setFilters(updatedFilters);
                
                const apiFilters = {};
                Object.keys(updatedFilters).forEach(key => {
                    const value = updatedFilters[key];
                    if (Array.isArray(value) && value.length > 0) {
                        apiFilters[key] = value;
                    } else if (value !== '' && value !== false && value !== null && value !== undefined) {
                        if (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) {
                            apiFilters[key] = value;
                        }
                    }
                });
                
                try {
                    setLoading(true);
                    const data = await searchAdverts(apiFilters);
                    const transformedAdverts = data.map(advert => ({
                        id: advert.id,
                        title: advert.title,
                        details: advert.description,
                        address: advert.warehouse.address,
                        scale: advert.warehouse.scale,
                        price: advert.warehouse.pricePerMonth,
                        floor: advert.warehouse.floor,
                        buildingType: REVERSE_BUILDING_TYPE_MAP[advert.warehouse.buildingType] || t.search.unknownType,
                        city: REVERSE_CITY_MAP[advert.warehouse.city] || t.search.unknownCity,
                        url: advert.warehouse.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
                        createdAt: advert.createdAt,
                        isActive: advert.isActive,
                        author: advert.author
                    }));
                    setAdverts(transformedAdverts);
                    setTotalCount(transformedAdverts.length);
                } catch (error) {
                    console.error('Search error:', error);
                    setError(t.search.loadError);
                } finally {
                    setLoading(false);
                }
            } else {
                handleSearch();
            }
        };

        fetchInitialData();
    }, []);

    const isSelected = (field, value) => {
        const numericValue = parseInt(value);
        return filters[field] && filters[field].includes(numericValue);
    };

    return (
        <>
            <Header />
            <div className="search-page">
                <div className="search-container">
                    <div className="filters-section">
                        <h1 className="filters-title">{t.search.title}</h1>

                        <div className="filters-row">
                            <div className="filter-group">
                                <label className="filter-label">{t.search.priceLabel}</label>
                                <div className="price-inputs">
                                    <input
                                        type="number"
                                        placeholder={t.search.from}
                                        className="filter-input"
                                        value={filters.priceFrom}
                                        onChange={(e) => handleFilterChange('priceFrom', e.target.value)}
                                        min="0"
                                    />
                                    <input
                                        type="number"
                                        placeholder={t.search.to}
                                        className="filter-input"
                                        value={filters.priceTo}
                                        onChange={(e) => handleFilterChange('priceTo', e.target.value)}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">{t.search.floorLabel}</label>
                                <div className="price-inputs">
                                    <input
                                        type="number"
                                        placeholder={t.search.from}
                                        className="filter-input"
                                        value={filters.floorFrom}
                                        onChange={(e) => handleFilterChange('floorFrom', e.target.value)}
                                        min="0"
                                    />
                                    <input
                                        type="number"
                                        placeholder={t.search.to}
                                        className="filter-input"
                                        value={filters.floorTo}
                                        onChange={(e) => handleFilterChange('floorTo', e.target.value)}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">{t.search.areaLabel}</label>
                                <div className="price-inputs">
                                    <input
                                        type="number"
                                        placeholder={t.search.from}
                                        className="filter-input"
                                        value={filters.areaFrom}
                                        onChange={(e) => handleFilterChange('areaFrom', e.target.value)}
                                        min="0"
                                    />
                                    <input
                                        type="number"
                                        placeholder={t.search.to}
                                        className="filter-input"
                                        value={filters.areaTo}
                                        onChange={(e) => handleFilterChange('areaTo', e.target.value)}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">{t.search.buildingTypeLabel}</label>
                                <select
                                    className="filter-select"
                                    value={filters.buildingType}
                                    onChange={(e) => handleFilterChange('buildingType', e.target.value)}
                                >
                                    <option value="">{t.search.selectBuildingType}</option>
                                    {buildingTypes.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">{t.search.cityLabel}</label>
                                <select
                                    className="filter-select"
                                    value={filters.city}
                                    onChange={(e) => handleFilterChange('city', e.target.value)}
                                >
                                    <option value="">{t.search.selectCity}</option>
                                    {cities.map((city) => (
                                        <option key={city.value} value={city.value}>{city.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="filters-row-multi">
                            <div className="filter-group">
                                <label className="filter-label">{t.search.communicationsLabel}</label>
                                <div className="multi-select">
                                    {communications.map((comm) => (
                                        <label key={comm.value} className="multi-select-label">
                                            <input
                                                type="checkbox"
                                                checked={isSelected('communications', comm.value)}
                                                onChange={() => handleMultiSelectChange('communications', comm.value)}
                                                className="multi-select-checkbox"
                                            />
                                            <span className="multi-select-text">{comm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">{t.search.appliancesLabel}</label>
                                <div className="multi-select">
                                    {appliances.map((appliance) => (
                                        <label key={appliance.value} className="multi-select-label">
                                            <input
                                                type="checkbox"
                                                checked={isSelected('appliances', appliance.value)}
                                                onChange={() => handleMultiSelectChange('appliances', appliance.value)}
                                                className="multi-select-checkbox"
                                            />
                                            <span className="multi-select-text">{appliance.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">{t.search.infrastructureLabel}</label>
                                <div className="multi-select">
                                    {infrastructure.map((infra) => (
                                        <label key={infra.value} className="multi-select-label">
                                            <input
                                                type="checkbox"
                                                checked={isSelected('infrastructure', infra.value)}
                                                onChange={() => handleMultiSelectChange('infrastructure', infra.value)}
                                                className="multi-select-checkbox"
                                            />
                                            <span className="multi-select-text">{infra.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">{t.search.sortingLabel}</label>
                                <select
                                    className="filter-select"
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                >
                                    {SORTING_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="filter-actions">
                            <button
                                className="search-btn"
                                onClick={handleSearch}
                                disabled={loading}
                            >
                                {loading ? t.search.searchingBtn : t.search.searchBtn}
                            </button>
                            <button
                                className="reset-btn"
                                onClick={handleReset}
                                disabled={loading}
                            >
                                {t.search.resetBtn}
                            </button>
                        </div>
                    </div>

                    <div className="results-section">
                        <div className="results-header">
                            <h2 className="results-title">
                                {t.search.resultsTitle} {totalCount > 0 && `(${totalCount})`}
                            </h2>
                            {loading && <div className="loading-indicator">{t.search.loading}</div>}
                            {error && <div className="error-message">{error}</div>}
                        </div>

                        {adverts.length === 0 && !loading && !error ? (
                            <div className="no-results">
                                <p>{t.search.noResults}</p>
                            </div>
                        ) : (
                            <div className="adverts-grid">
                                {adverts.map((advert) => (
                                    <AdvertCard
                                        advert={advert}
                                        key={advert.id}
                                        showDetails={true}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default SearchPage;