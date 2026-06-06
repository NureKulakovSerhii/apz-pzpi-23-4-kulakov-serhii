import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addToFavorites, removeFromFavorites, getAdvertById, getFavorites } from '../services/advertService';
import '../styles/WarehousePage.css';
import { 
    getReverseBuildingTypeMap,
    getReverseCityMap,
    getReverseCommunicationsMap,
    getReverseAppliancesMap,
    getReverseInfrastructureMap
} from '../constants/mapping';
import { useTranslation } from '../hooks/useTranslation';

function WarehousePage() {
    const { id } = useParams();  
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [advert, setAdvert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [showPhone, setShowPhone] = useState(false);
    const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
    
    const [reverseMaps, setReverseMaps] = useState({
        REVERSE_BUILDING_TYPE_MAP: {},
        REVERSE_CITY_MAP: {},
        REVERSE_COMMUNICATIONS_MAP: {},
        REVERSE_APPLIANCES_MAP: {},
        REVERSE_INFRASTRUCTURE_MAP: {}
    });
    
    useEffect(() => {
        setReverseMaps({
            REVERSE_BUILDING_TYPE_MAP: getReverseBuildingTypeMap(t),
            REVERSE_CITY_MAP: getReverseCityMap(t),
            REVERSE_COMMUNICATIONS_MAP: getReverseCommunicationsMap(t),
            REVERSE_APPLIANCES_MAP: getReverseAppliancesMap(t),
            REVERSE_INFRASTRUCTURE_MAP: getReverseInfrastructureMap(t)
        });
    }, [t]);
    
    const {
        REVERSE_BUILDING_TYPE_MAP,
        REVERSE_CITY_MAP,
        REVERSE_COMMUNICATIONS_MAP,
        REVERSE_APPLIANCES_MAP,
        REVERSE_INFRASTRUCTURE_MAP
    } = reverseMaps;
    
    const formatAccountDate = (dateString) => {
        if (!dateString) return t.warehouse.dateNotSpecified;
        
        try {
            const date = new Date(dateString);
            
            if (isNaN(date.getTime())) {
                return t.warehouse.dateNotSpecified;
            }
            
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            
            return `${day}.${month}.${year}`;
        } catch (error) {
            console.error('Date formatting error:', error);
            return t.warehouse.dateNotSpecified;
        }
    };
    
    useEffect(() => {
        const loadAdvertData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                if (!id) {
                    throw new Error('Advert ID not specified');
                }
                const data = await getAdvertById(id);
                setAdvert(data);
                const token = localStorage.getItem('access_token');
                if (token) {
                    try {
                        const favorites = await getFavorites();
                        const isFavorite = Array.isArray(favorites) && 
                                          favorites.some(favorite => favorite.id === data.id);
                        setIsLiked(isFavorite);
                    } catch (favoriteError) {
                        console.error('Error checking favorite status:', favoriteError);
                    }
                }
                
            } catch (error) {
                console.error('Error loading advert:', error);
                setError(error.message || t.warehouse.loadError);
            } finally {
                setLoading(false);
            }
        };
        
        loadAdvertData();
    }, [id, t.warehouse.loadError]);
    
    const handleShowPhone = () => {
        setShowPhone(true);
    };
    
    const handleLikeClick = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert(t.warehouse.loginRequired);
            navigate('/login');
            return;
        }
        
        if (isLoadingFavorite || !advert) return;
        
        setIsLoadingFavorite(true);
        
        try {
            if (isLiked) {
                await removeFromFavorites(advert.id);
                setIsLiked(false);
                console.log('Removed from favorites:', advert.id);
            } else {
                await addToFavorites(advert.id);
                setIsLiked(true);
                console.log('Added to favorites:', advert.id);
            }
        } catch (error) {
            console.error('Error with favorites:', error);
            alert(error.message || t.warehouse.favoriteError);
        } finally {
            setIsLoadingFavorite(false);
        }
    };
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="warehouse-page loading">
                <div className="warehouse-container">
                    <div className="warehouse-header">
                        <button 
                            className="back-btn"
                            onClick={() => navigate(-1)}
                        >
                            ← {t.warehouse.back}
                        </button>
                    </div>
                    <div className="loading-message">
                        <div className="loading-spinner"></div>
                        <p>{t.warehouse.loading}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !advert) {
        return (
            <div className="warehouse-page error">
                <div className="warehouse-container">
                    <div className="warehouse-header">
                        <button 
                            className="back-btn"
                            onClick={() => navigate(-1)}
                        >
                            ← {t.warehouse.back}
                        </button>
                    </div>
                    <div className="error-message">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <h3 className="error-title">{t.warehouse.errorTitle}</h3>
                        <p className="error-text">{error || t.warehouse.errorNotFound}</p>
                        <button 
                            className="retry-btn"
                            onClick={() => window.location.reload()}
                        >
                            {t.warehouse.retry}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const warehouse = advert.warehouse || {};
    
    const formatList = (items, reverseMap) => {
        if (!items || items.length === 0) return t.warehouse.notSpecified;
        return items.map(item => reverseMap[item] || item).join(', ');
    };
    
    const details = [
        t.warehouse.area.replace('{scale}', warehouse.scale || 0),
        warehouse.floor !== undefined ? t.warehouse.floor.replace('{floor}', warehouse.floor) : null,
        t.warehouse.buildingType.replace('{type}', REVERSE_BUILDING_TYPE_MAP[warehouse.buildingType] || t.warehouse.unknownType),
        t.warehouse.city.replace('{city}', REVERSE_CITY_MAP[warehouse.city] || t.warehouse.unknownCity),
        t.warehouse.communications.replace('{list}', formatList(warehouse.communications, REVERSE_COMMUNICATIONS_MAP)),
        t.warehouse.infrastructure.replace('{list}', formatList(warehouse.infrastructures, REVERSE_INFRASTRUCTURE_MAP)),
        t.warehouse.facilities.replace('{list}', formatList(warehouse.householdAppliances, REVERSE_APPLIANCES_MAP))
    ].filter(detail => detail !== null);

    const address = {
        city: REVERSE_CITY_MAP[warehouse.city] || t.warehouse.cityNotSpecified,
        street: warehouse.address || t.warehouse.addressNotSpecified
    };

    const seller = {
        name: advert.author?.email ? advert.author.email.split('@')[0].toUpperCase() : t.warehouse.sellerDefaultName,
        memberSince: advert.author?.createdAt 
            ? t.warehouse.memberSince.replace('{date}', formatAccountDate(advert.author.createdAt))
            : t.warehouse.memberSince.replace('{date}', formatDate(advert.createdAt)),
        phone: advert.author?.phone || t.warehouse.phoneNotSpecified,
        email: advert.author?.email || t.warehouse.emailNotSpecified
    };

    return (
        <div className="warehouse-page">
            <div className="warehouse-container">
                <div className="warehouse-header">
                    <button 
                        className="back-btn"
                        onClick={() => navigate(-1)}
                    >
                        ← {t.warehouse.back}
                    </button>
                    <button 
                        className={`like-btn ${isLiked ? 'liked' : ''}`}
                        onClick={handleLikeClick}
                        disabled={isLoadingFavorite}
                        title={isLiked ? t.warehouse.removeFromFavorites : t.warehouse.addToFavorites}
                    >
                        {isLoadingFavorite ? (
                            <span className="loading-spinner-small"></span>
                        ) : isLiked ? (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        ) : (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeWidth="2"/>
                            </svg>
                        )}
                    </button>
                </div>

                <div className="warehouse-content">
                    <div className="warehouse-image-section">
                        <img 
                            src={warehouse.imageUrl || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600"} 
                            alt={advert.title}
                            className="warehouse-main-image"
                            onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600";
                            }}
                        />
                    </div>

                    <div className="warehouse-info-section">
                        <div className="warehouse-publish-date">
                            {t.warehouse.published.replace('{date}', formatDate(advert.createdAt))}
                        </div>
                        <h1 className="warehouse-title">{advert.title}</h1>
                        <div className="warehouse-description">
                            {advert.description ? (
                                advert.description.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))
                            ) : (
                                <p>{t.warehouse.noDescription}</p>
                            )}
                        </div>
                        <div className="warehouse-price">
                            {warehouse.pricePerMonth 
                                ? t.warehouse.price.replace('{price}', warehouse.pricePerMonth) 
                                : t.warehouse.priceNotSpecified}
                        </div>
                        <button 
                            className="show-phone-btn" 
                            onClick={handleShowPhone}
                            disabled={!advert.author?.phone}
                        >
                            {showPhone ? seller.phone : t.warehouse.showPhone}
                        </button>
                    </div>

                    <div className="warehouse-left-bottom">
                        <div className="warehouse-details-section">
                            <h2 className="details-title">{t.warehouse.detailsTitle}</h2>
                            <div className="details-tags">
                                {details.map((detail, index) => (
                                    <span key={index} className="detail-tag">{detail}</span>
                                ))}
                            </div>
                        </div>

                        <div className="warehouse-seller-section">
                            <h2 className="details-title">{t.warehouse.sellerTitle}</h2>
                            <div className="seller-content">
                                <div className="seller-avatar">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                    </svg>
                                </div>
                                <div className="seller-info">
                                    <h3 className="seller-name">{seller.name}</h3>
                                    <p className="seller-member-since">{seller.memberSince}</p>
                                </div>
                                <div className="seller-contact">
                                    <div className="seller-phone-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM12 3v10l3-3h6V3h-9z"/>
                                        </svg>
                                    </div>
                                    {showPhone ? (
                                        <a href={`tel:${seller.phone}`} className="seller-phone">
                                            {seller.phone}
                                        </a>
                                    ) : (
                                        <button className="show-phone-link" onClick={handleShowPhone}>
                                            {t.warehouse.showPhone}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="warehouse-map-section">
                        <div className="map-header">
                            <div className="map-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                            </div>
                            <div className="map-address">
                                <h3 className="map-city">{address.city}</h3>
                                <p className="map-street">{address.street}</p>
                            </div>
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.street + ', ' + address.city)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="map-link"
                            >
                                {t.warehouse.viewOnMap}
                            </a>
                        </div>
                        <div className="map-placeholder">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WarehousePage;