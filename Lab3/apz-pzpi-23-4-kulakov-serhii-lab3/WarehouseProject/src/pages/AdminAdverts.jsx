import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import '../styles/AdminAdverts.css';
import { getInactiveAdverts, activateAdvert, deleteAdvert } from '../services/advertService';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from '../hooks/useTranslation';

function AdminAdverts() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [adverts, setAdverts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            let userRoles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
            
            if (typeof userRoles === 'string') {
                userRoles = [userRoles];
            }
            
            const hasModeratorRole = Array.isArray(userRoles) && userRoles.includes('Moderator');
            
            if (!hasModeratorRole) {
                alert(t.adminAdverts.accessDenied);
                navigate('/');
                return;
            }
        } catch {
            navigate('/login');
            return;
        }

        loadInactiveAdverts();
    }, [navigate, t]);

    const loadInactiveAdverts = async () => {
        try {
            setLoading(true);
            const data = await getInactiveAdverts();
            setAdverts(data);
        } catch (error) {
            console.error('Error loading adverts:', error);
            alert(t.adminAdverts.loadError);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (advertId) => {
        if (!window.confirm(t.adminAdverts.confirmActivate)) {
            return;
        }

        try {
            setActionLoading(advertId);
            await activateAdvert(advertId);
            alert(t.adminAdverts.activateSuccess);
            setAdverts(prev => prev.filter(ad => ad.id !== advertId));
        } catch (error) {
            console.error('Error activating advert:', error);
            alert(t.adminAdverts.activateError);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (advertId) => {
        if (!window.confirm(t.adminAdverts.confirmDelete)) {
            return;
        }

        try {
            setActionLoading(advertId);
            await deleteAdvert(advertId);
            alert(t.adminAdverts.deleteSuccess);
            setAdverts(prev => prev.filter(ad => ad.id !== advertId));
        } catch (error) {
            console.error('Error deleting advert:', error);
            alert(t.adminAdverts.deleteError);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <>
            <Header />
            <div className="admin-adverts-page">
                <div className="admin-adverts-container">
                    <div className="page-header">
                        <button className="back-btn" onClick={() => navigate('/admin')}>
                            ← {t.adminAdverts.back}
                        </button>
                        <h1>{t.adminAdverts.title}</h1>
                        <p className="page-subtitle">{t.adminAdverts.subtitle}</p>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>{t.adminAdverts.loading}</p>
                        </div>
                    ) : adverts.length === 0 ? (
                        <div className="empty-state">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                            </svg>
                            <h2>{t.adminAdverts.noAdverts}</h2>
                            <p>{t.adminAdverts.noAdvertsSubtitle}</p>
                        </div>
                    ) : (
                        <div className="adverts-list">
                            {adverts.map(advert => (
                                <div key={advert.id} className="advert-card-admin">
                                    <div 
                                        className="advert-image"
                                        onClick={() => navigate(`/warehouse/${advert.id}`)}
                                        style={{ cursor: 'pointer' }}
                                        title={t.adminAdverts.viewFullAdvert}
                                    >
                                        <img 
                                            src={advert.warehouse?.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400'} 
                                            alt={advert.title}
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400';
                                            }}
                                        />
                                        <div className="view-overlay">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    <div 
                                        className="advert-info"
                                        onClick={() => navigate(`/warehouse/${advert.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="info-main">
                                            <h3>{advert.title}</h3>
                                            <p className="description">
                                                {advert.description?.length > 120 
                                                    ? advert.description.substring(0, 120) + '...' 
                                                    : advert.description || t.adminAdverts.noDescription}
                                            </p>
                                            <div className="details">
                                                <span className="detail-item">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                                    </svg>
                                                    {advert.warehouse?.address || t.adminAdverts.addressNotSpecified}
                                                </span>
                                                <span className="detail-item">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                                                    </svg>
                                                    {advert.warehouse?.scale || 0} {t.advertCard.areaFormat.replace('{scale}', '') || 'кв.м'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="info-price">
                                            <span className="price">{advert.warehouse?.pricePerMonth || 0} {t.advertCard.priceFormat.replace('{price}', '').trim() || 'грн/міс'}</span>
                                        </div>
                                    </div>

                                    <div className="advert-actions">
                                        <button 
                                            className="btn-activate"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleActivate(advert.id);
                                            }}
                                            disabled={actionLoading === advert.id}
                                        >
                                            {actionLoading === advert.id ? (
                                                <>
                                                    <div className="btn-spinner"></div>
                                                    {t.adminAdverts.processing}
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                                    </svg>
                                                    {t.adminAdverts.activate}
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            className="btn-delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(advert.id);
                                            }}
                                            disabled={actionLoading === advert.id}
                                        >
                                            {actionLoading === advert.id ? (
                                                <>
                                                    <div className="btn-spinner"></div>
                                                    {t.adminAdverts.processing}
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                                    </svg>
                                                    {t.adminAdverts.delete}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default AdminAdverts;