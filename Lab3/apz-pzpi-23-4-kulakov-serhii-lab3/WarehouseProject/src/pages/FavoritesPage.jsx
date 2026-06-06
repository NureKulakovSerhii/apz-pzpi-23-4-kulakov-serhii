import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import AdvertCard from "../components/AdvertCard";
import { getFavorites, removeFromFavorites } from '../services/advertService';
import '../styles/Favorites.css';
import { 
    getReverseBuildingTypeMap,
    getReverseCityMap
} from '../constants/mapping';
import { useTranslation } from '../hooks/useTranslation';

function Favorites() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [sortBy, setSortBy] = useState('date');
    const [viewMode, setViewMode] = useState('list');
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [reverseMaps, setReverseMaps] = useState({
        REVERSE_BUILDING_TYPE_MAP: {},
        REVERSE_CITY_MAP: {}
    });
    
    useEffect(() => {
        setReverseMaps({
            REVERSE_BUILDING_TYPE_MAP: getReverseBuildingTypeMap(t),
            REVERSE_CITY_MAP: getReverseCityMap(t)
        });
    }, [t]);
    
    const {
        REVERSE_BUILDING_TYPE_MAP,
        REVERSE_CITY_MAP
    } = reverseMaps;
   
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const token = localStorage.getItem('access_token');
                if (!token) {
                    setError(t.favorites.authError);
                    setLoading(false);
                    return;
                }
                
                const data = await getFavorites();
                console.log('Отримані обрані оголошення:', data);
                
                if (!Array.isArray(data)) {
                    throw new Error(t.favorites.serverError);
                }
                
                const transformedFavorites = data.map(advert => ({
                    id: advert.id,
                    title: advert.title,
                    description: advert.description,
                    address: advert.warehouse?.address || t.favorites.noAddress,
                    scale: advert.warehouse?.scale || 0,
                    price: advert.warehouse?.pricePerMonth || 0,
                    floor: advert.warehouse?.floor || 0,
                    buildingType: REVERSE_BUILDING_TYPE_MAP[advert.warehouse?.buildingType] || t.favorites.unknownType,
                    city: REVERSE_CITY_MAP[advert.warehouse?.city] || t.favorites.unknownCity,
                    url: advert.warehouse?.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
                    createdAt: advert.createdAt,
                    addedDate: advert.createdAt, 
                    isFavorite: true,
                    author: advert.author
                }));
                
                setFavorites(transformedFavorites);
                
            } catch (error) {
                console.error('Помилка завантаження обраних оголошень:', error);
                setError(error.message || t.favorites.loadError);
                setFavorites([]);
            } finally {
                setLoading(false);
            }
        };
        
        loadFavorites();
    }, [t.favorites.authError, t.favorites.serverError, t.favorites.noAddress, t.favorites.unknownType, t.favorites.unknownCity, t.favorites.loadError]);

    const handleClearAll = async () => {
        if (favorites.length === 0) return;
        
        const confirmMessage = t.favorites.confirmClear.replace('{count}', favorites.length);
        if (!window.confirm(confirmMessage)) {
            return;
        }
        try {
            const removePromises = favorites.map(advert => removeFromFavorites(advert.id));
            await Promise.all(removePromises);
            setFavorites([]);
            
            alert(t.favorites.alertSuccess);
            
        } catch (error) {
            console.error('Помилка видалення всіх обраних:', error);
            alert(error.message || t.favorites.deleteError);
        }
    };

    const handleSortChange = (sortType) => {
        setSortBy(sortType);
        
        let sortedFavorites = [...favorites];
        
        switch(sortType) {
            case 'price_asc':
                sortedFavorites.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                sortedFavorites.sort((a, b) => b.price - a.price);
                break;
            case 'area_asc':
                sortedFavorites.sort((a, b) => a.scale - b.scale);
                break;
            case 'area_desc':
                sortedFavorites.sort((a, b) => b.scale - a.scale);
                break;
            case 'date':
            default:
                sortedFavorites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }
        
        setFavorites(sortedFavorites);
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="favorites-page loading">
                    <div className="favorites-container">
                        <h1 className="favorites-title">{t.favorites.title}</h1>
                        <div className="loading-message">
                            <div className="loading-spinner"></div>
                            <p>{t.favorites.loading}</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="favorites-page error">
                    <div className="favorites-container">
                        <h1 className="favorites-title">{t.favorites.title}</h1>
                        <div className="error-message">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            <h3 className="error-title">{t.favorites.errorTitle}</h3>
                            <p className="error-text">{error}</p>
                            {(error === t.favorites.authError) && (
                                <button 
                                    className="login-btn"
                                    onClick={() => navigate('/login')}
                                >
                                    {t.favorites.loginBtn}
                                </button>
                            )}
                            <button 
                                className="retry-btn"
                                onClick={() => window.location.reload()}
                            >
                                {t.favorites.retryBtn}
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (favorites.length === 0) {
        return (
            <>
                <Header />
                <div className="favorites-page empty">
                    <div className="favorites-container">
                        <h1 className="favorites-title">{t.favorites.title}</h1>
                        <div className="empty-favorites">
                            <div className="empty-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
                                </svg>
                            </div>
                            <h3 className="empty-title">{t.favorites.emptyTitle}</h3>
                            <p className="empty-text">{t.favorites.emptyText}</p>
                            <button 
                                className="browse-btn"
                                onClick={() => navigate('/')}
                            >
                                {t.favorites.browseBtn}
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="favorites-page">
                <div className="favorites-container">
                    <h1 className="favorites-main-title">{t.favorites.title}</h1>
                    
                    <div className="favorites-tabs-section">
                        <div className="favorites-tabs">
                            <button className="tab-btn active">
                                {t.favorites.tabTitle} ({favorites.length})
                            </button>
                        </div>
                        
                        <button 
                            className="clear-all-btn-top"
                            onClick={handleClearAll}
                            disabled={loading || favorites.length === 0}
                        >
                            {loading ? t.favorites.deleting : t.favorites.clearBtn}
                        </button>
                    </div>

                    <div className="favorites-controls">
                        <div className="sort-dropdown">
                            <select 
                                className="sort-select"
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                disabled={loading}
                            >
                                <option value="date">{t.favorites.sortDate}</option>
                                <option value="price_asc">{t.favorites.sortPriceAsc}</option>
                                <option value="price_desc">{t.favorites.sortPriceDesc}</option>
                                <option value="area_asc">{t.favorites.sortAreaAsc}</option>
                                <option value="area_desc">{t.favorites.sortAreaDesc}</option>
                            </select>
                        </div>
                        
                        <div className="view-mode-buttons">
                            <span className="view-label">{t.favorites.viewLabel}</span>
                            <button 
                                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                disabled={loading}
                                aria-label={t.favorites.viewList}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                                </svg>
                            </button>
                            <button 
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                disabled={loading}
                                aria-label={t.favorites.viewGrid}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className={`favorites-list ${viewMode}`}>
                        {favorites.map((advert) => (
                            <div key={advert.id} className="favorite-item">
                                <div className="favorite-item-header"></div>
                                <AdvertCard 
                                    advert={advert} 
                                    initialIsFavorite={true}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Favorites;