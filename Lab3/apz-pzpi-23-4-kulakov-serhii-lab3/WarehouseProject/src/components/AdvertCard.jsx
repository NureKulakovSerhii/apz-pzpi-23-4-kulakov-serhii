import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToFavorites, getFavorites, removeFromFavorites } from '../services/advertService';
import '../styles/AdvertCard.css';
import { useTranslation } from '../hooks/useTranslation';

const API_URL = 'https://localhost:7234';

const getImageUrl = (imageUrl) => {
    if (!imageUrl || imageUrl.trim() === '') {
        return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400';
    }
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return `${API_URL}${imageUrl}`;
    return `${API_URL}/images/${imageUrl}`;
};

function AdvertCard({ advert }) {
    const { t } = useTranslation();
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isInComparison, setIsInComparison] = useState(false);
    const navigate = useNavigate();

    const imageUrl = getImageUrl(advert.url || advert.imageUrl || advert.warehouse?.imageUrl);

    useEffect(() => {
        const initializeFavoriteStatus = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    setIsLiked(false);
                    setIsInitialized(true);
                    return;
                }
                const favorites = await getFavorites();
                if (Array.isArray(favorites)) {
                    const isFavorite = favorites.some(favorite => favorite.id === advert.id);
                    setIsLiked(isFavorite);
                } else {
                    setIsLiked(false);
                }
            } catch (error) {
                console.error(error);
                setIsLiked(false);
            } finally {
                setIsInitialized(true);
            }
        };
        initializeFavoriteStatus();

        const checkComparisonStatus = () => {
            const comparisonItems = JSON.parse(localStorage.getItem('comparisonAdverts') || '[]');
            const isInList = comparisonItems.some(item => item.id === advert.id);
            setIsInComparison(isInList);
        };
        
        checkComparisonStatus();
        
        const handleStorageChange = () => {
            checkComparisonStatus();
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [advert.id]);

    async function onLikeClick(e) {
        e.stopPropagation();
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert(t.advertCard.loginRequired);
            navigate('/login');
            return;
        }
        if (isLoading || !isInitialized) return;
        setIsLoading(true);
        try {
            if (isLiked) {
                await removeFromFavorites(advert.id);
                setIsLiked(false);
            } else {
                await addToFavorites(advert.id);
                setIsLiked(true);
            }
        } catch (error) {
            console.error(error);
            alert(error.message || t.advertCard.favoriteError);
        } finally {
            setIsLoading(false);
        }
    }

    function handleCardClick() {
        navigate(`/warehouse/${advert.id}`);
    }

    const handleImageError = () => {
        setImageError(true);
    };

    const handleAddToComparison = (e) => {
        e.stopPropagation();
        
        const currentComparison = JSON.parse(localStorage.getItem('comparisonAdverts') || '[]');
        
        if (currentComparison.length >= 2) {
            alert(t.advertCard.comparisonMaxLimit);
            return;
        }
        
        const isAlreadyAdded = currentComparison.some(item => item.id === advert.id);
        if (isAlreadyAdded) {
            alert(t.advertCard.alreadyInComparisonAlert);
            return;
        }
        
        const advertForComparison = {
            id: advert.id,
            title: advert.title,
            address: advert.address || advert.warehouse?.address || t.advertCard.addressNotSpecified,
            price: advert.price || advert.warehouse?.pricePerMonth || 0,
            area: advert.scale || advert.warehouse?.scale || 0,
            floor: advert.floor || advert.warehouse?.floor || 0,
            buildingType: advert.buildingType || advert.warehouse?.buildingType || t.advertCard.buildingTypeUnknown,
            city: advert.city || advert.warehouse?.city || t.advertCard.cityUnknown,
            communications: advert.communications || advert.warehouse?.communications || [],
            appliances: advert.householdAppliances || advert.warehouse?.householdAppliances || [],
            infrastructure: advert.infrastructures || advert.warehouse?.infrastructures || [],
            imageUrl: advert.url || advert.imageUrl || advert.warehouse?.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400'
        };
        
        const updatedComparison = [...currentComparison, advertForComparison];
        localStorage.setItem('comparisonAdverts', JSON.stringify(updatedComparison));
        setIsInComparison(true);
        navigate('/compare');
    };

    return (
        <div className="advert-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <div className="advert-photo">
                <img 
                    src={imageError ? 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400' : imageUrl} 
                    alt={advert.title} 
                    onError={handleImageError}
                    loading="lazy"
                />
                {imageError && (
                    <div className="no-image-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                    </div>
                )}
            </div>

            <div className="advert-content">
                <h3 className="advert-title">{advert.title}</h3>
                <p className="advert-description">{advert.description}</p>
                <p className="advert-address">{advert.address || t.advertCard.addressNotSpecified}</p>
                <p className="advert-scale">{t.advertCard.areaFormat.replace('{scale}', advert.scale || 0)}</p>
            </div>

            <div className="advert-right-section">
                <div className="advert-price-section">
                    <h3 className="advert-price">{t.advertCard.priceFormat.replace('{price}', advert.price || 0)}</h3>
                    <p className="advert-price-label">{t.advertCard.negotiable}</p>
                </div>
                <button 
                    className={`likeadvert-btn ${isLiked ? 'liked' : ''}`} 
                    onClick={onLikeClick}
                    disabled={isLoading}
                    title={isLiked ? t.advertCard.removeFromFavorites : t.advertCard.addToFavorites}
                >
                    {isLoading ? (
                        <span className="loading-spinner">...</span>
                    ) : isLiked ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeWidth="2"/>
                        </svg>
                    )}
                </button>
                <button 
                    className={`compare-btn ${isInComparison ? 'in-comparison' : ''}`}
                    onClick={handleAddToComparison}
                    title={isInComparison ? t.advertCard.alreadyInComparison : t.advertCard.addToComparison}
                >
                    ♾️
                </button>
            </div>
        </div>
    );
}

export default AdvertCard;