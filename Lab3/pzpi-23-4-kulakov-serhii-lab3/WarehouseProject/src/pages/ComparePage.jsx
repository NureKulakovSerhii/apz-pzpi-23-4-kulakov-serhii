import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import '../styles/Compare.css';
import { 
    getReverseBuildingTypeMap,
    getReverseCityMap,
    getReverseCommunicationsMap,
    getReverseAppliancesMap,
    getReverseInfrastructureMap
} from "../constants/mapping";
import { useTranslation } from '../hooks/useTranslation';

const API_URL = 'https://localhost:7234';

function Compare() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [selectedAdverts, setSelectedAdverts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [showFavoritesModal, setShowFavoritesModal] = useState(false);
    
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

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    };

    const getBuildingTypeName = (buildingTypeValue) => {
        if (buildingTypeValue === undefined || buildingTypeValue === null) return '—';
        return REVERSE_BUILDING_TYPE_MAP[buildingTypeValue] || t.compare?.unknownType || 'Unknown type';
    };

    const getCityName = (cityValue) => {
        if (cityValue === undefined || cityValue === null) return '—';
        return REVERSE_CITY_MAP[cityValue] || t.compare?.unknownCity || 'Unknown city';
    };

    const fetchAdvertDetails = async (advert) => {
        try {
            const response = await fetch(`${API_URL}/api/Advert/advert?advertId=${advert.id}`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });
            if (!response.ok) return advert;
            const data = await response.json();
            return {
                id: data.id,
                title: data.title,
                address: data.warehouse?.address || advert.address || t.compare?.addressNotSpecified || 'Address not specified',
                price: data.warehouse?.pricePerMonth || advert.price || 0,
                area: data.warehouse?.scale || advert.area || 0,
                floor: data.warehouse?.floor || advert.floor || 0,
                buildingType: getBuildingTypeName(data.warehouse?.buildingType),
                city: getCityName(data.warehouse?.city),
                communications: data.warehouse?.communications?.map(c => REVERSE_COMMUNICATIONS_MAP[c] || c) || advert.communications || [],
                appliances: data.warehouse?.householdAppliances?.map(a => REVERSE_APPLIANCES_MAP[a] || a) || advert.appliances || [],
                infrastructure: data.warehouse?.infrastructures?.map(i => REVERSE_INFRASTRUCTURE_MAP[i] || i) || advert.infrastructure || [],
                imageUrl: data.warehouse?.imageUrl || advert.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
                rawData: data
            };
        } catch {
            return advert;
        }
    };
    useEffect(() => {
        const refreshDataForLanguage = async () => {
            if (selectedAdverts.length > 0) {
                const updatedAdverts = await Promise.all(
                    selectedAdverts.map(advert => fetchAdvertDetails(advert))
                );
                setSelectedAdverts(updatedAdverts);
                localStorage.setItem('comparisonAdverts', JSON.stringify(updatedAdverts));
            }
        };
        refreshDataForLanguage();
    }, [t]);

    useEffect(() => {
        const loadAdvertDetails = async () => {
            setLoading(true);
            const savedAdverts = JSON.parse(localStorage.getItem('comparisonAdverts') || '[]');
            if (savedAdverts.length > 0) {
                try {
                    const detailedAdverts = await Promise.all(
                        savedAdverts.map(a => a.rawData ? a : fetchAdvertDetails(a))
                    );
                    setSelectedAdverts(detailedAdverts);
                } catch {
                    setSelectedAdverts(savedAdverts);
                }
            }
            setLoading(false);
        };
        loadAdvertDetails();
    }, []);

    const loadFavorites = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) { navigate('/login'); return; }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/Advert/favorites`, { headers: getAuthHeaders() });
            if (!response.ok) throw new Error();
            setFavorites(await response.json());
            setShowFavoritesModal(true);
        } catch {
            alert(t.compare?.loadFavoritesError || 'Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFromFavorites = async (advert) => {
        if (selectedAdverts.length >= 2) { alert(t.compare?.maxLimit || 'Maximum 2 warehouses'); return; }
        if (selectedAdverts.some(a => a.id === advert.id)) { alert(t.compare?.alreadyAdded || 'Already added'); return; }
        setLoading(true);
        const detailed = await fetchAdvertDetails(advert);
        const updated = [...selectedAdverts, detailed];
        setSelectedAdverts(updated);
        localStorage.setItem('comparisonAdverts', JSON.stringify(updated));
        setLoading(false);
        setShowFavoritesModal(false);
    };

    const removeFromComparison = (id) => {
        const updated = selectedAdverts.filter(a => a.id !== id);
        setSelectedAdverts(updated);
        localStorage.setItem('comparisonAdverts', JSON.stringify(updated));
    };

    const clearComparison = () => {
        if (selectedAdverts.length > 0 && window.confirm(t.compare?.clearConfirm || 'Remove all?')) {
            setSelectedAdverts([]);
            localStorage.removeItem('comparisonAdverts');
        }
    };

    const refreshComparison = async () => {
        if (!selectedAdverts.length) return;
        setLoading(true);
        try {
            const updated = await Promise.all(selectedAdverts.map(a => fetchAdvertDetails(a)));
            setSelectedAdverts(updated);
            localStorage.setItem('comparisonAdverts', JSON.stringify(updated));
        } catch {
            alert(t.compare?.updateDataError || 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    const getBest = () => selectedAdverts.length < 2 ? {} : {
        price: Math.min(...selectedAdverts.map(a => a.price)),
        area:  Math.max(...selectedAdverts.map(a => a.area)),
    };

    const getCellClass = (param, value) => {
        if (selectedAdverts.length < 2) return '';
        const best = getBest();
        return value === best[param] ? 'cell-best' : 'cell-worse';
    };

    const ComparisonFeatures = ({ items1 = [], items2 = [] }) => {
        const all = [...new Set([...items1, ...items2])];

        if (selectedAdverts.length === 1) {
            if (!items1.length) return <span style={{ fontSize: 13, color: '#bbb' }}>—</span>;
            return (
                <ul className="features-list">
                    {items1.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            );
        }

        if (!all.length) return <span style={{ fontSize: 13, color: '#bbb' }}>—</span>;
        return (
            <div className="features-comparison">
                {all.map(item => (
                    <div key={item} className="feature-comparison-row">
                        <div className={`feature-cell ${items1.includes(item) ? 'has-feature' : 'no-feature'}`}>
                            {items1.includes(item) ? '✓' : '✗'}
                        </div>
                        <div className="feature-name">{item}</div>
                        <div className={`feature-cell ${items2.includes(item) ? 'has-feature' : 'no-feature'}`}>
                            {items2.includes(item) ? '✓' : '✗'}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const FavoritesModal = () => {
        if (!showFavoritesModal) return null;
        return (
            <div className="modal-overlay" onClick={() => setShowFavoritesModal(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>{t.compare?.selectWarehouses || 'Select warehouses'}</h3>
                        <button className="modal-close" onClick={() => setShowFavoritesModal(false)}>×</button>
                    </div>
                    <div className="modal-body">
                        {favorites.length === 0 ? (
                            <div className="modal-empty">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                <p>{t.compare?.noFavorites || 'No favorites'}</p>
                            </div>
                        ) : (
                            <div className="favorites-grid">
                                {favorites.map(advert => {
                                    const alreadyAdded = selectedAdverts.some(a => a.id === advert.id);
                                    const full = selectedAdverts.length >= 2;
                                    return (
                                        <div key={advert.id} className="favorite-card">
                                            <img
                                                src={advert.warehouse?.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400'}
                                                alt={advert.title}
                                                className="favorite-image"
                                            />
                                            <div className="favorite-details">
                                                <h4>{advert.title}</h4>
                                                <p className="favorite-address">{advert.warehouse?.address || '—'}</p>
                                                <div className="favorite-specs">
                                                    <span>{advert.warehouse?.pricePerMonth || 0} грн/міс</span>
                                                    <span>·</span>
                                                    <span>{advert.warehouse?.scale || 0} м²</span>
                                                </div>
                                                <button
                                                    className="favorite-btn"
                                                    onClick={() => handleAddFromFavorites(advert)}
                                                    disabled={alreadyAdded || full}
                                                >
                                                    {alreadyAdded ? `✓ ${t.compare?.added || 'Added'}` : `+ ${t.compare?.add || 'Add'}`}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (selectedAdverts.length === 0) {
        return (
            <>
                <Header />
                <FavoritesModal />
                <div className="compare-page">
                    <div className="compare-container">
                        <div className="compare-title-center">
                            <h1>{t.compare?.title || 'Comparison'}</h1>
                            <p className="subtitle">{t.compare?.subtitle || 'Compare warehouses'}</p>
                        </div>
                        <div className="empty-state">
                            <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-2v2zm0 15H5l5-6v6zm9-15h-5v2h5v13l-5-6v9h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                            </svg>
                            <h2>{t.compare?.emptyTitle || 'Start Comparing'}</h2>
                            <p>{t.compare?.emptyText || 'Select warehouses to compare'}</p>
                            <button className="btn-primary" onClick={loadFavorites} disabled={loading}>
                                {loading ? t.compare?.loading || 'Loading...' : t.compare?.selectFromFavorites || 'Select from favorites'}
                            </button>
                            <p className="hint">{t.compare?.hint || 'or click "Compare" on warehouse page'}</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const isTwoAdverts = selectedAdverts.length === 2;

    return (
        <>
            <Header />
            <FavoritesModal />
            <div className="compare-page">
                <div className="compare-container">
                    <div className="compare-header flex-column-center">
                        <div className="compare-title-center">
                            <h1>{t.compare?.title || 'Comparison'}</h1>
                            <p className="subtitle">
                                {isTwoAdverts ? (t.compare?.twoWarehouses || '2 warehouses') : (t.compare?.oneWarehouse || '1 warehouse')} — {isTwoAdverts ? (t.compare?.readyToCompare || 'ready') : (t.compare?.addOneMore || 'add one more')}
                            </p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-refresh" onClick={refreshComparison} disabled={loading}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                                </svg>
                                {t.compare?.refresh || 'Refresh'}
                            </button>
                            <button className="btn-clear" onClick={clearComparison} disabled={loading}>{t.compare?.clear || 'Clear'}</button>
                        </div>
                    </div>

                    {!isTwoAdverts && (
                        <div className="add-panel">
                            <p>{t.compare?.addOneMore || 'add one more'}</p>
                            <button className="btn-add" onClick={loadFavorites} disabled={loading}>
                                + {t.compare?.selectFromFavorites || 'Select from favorites'}
                            </button>
                        </div>
                    )}

                    {isTwoAdverts && (
                        <div className="legend">
                            <div className="legend-item">
                                <div className="legend-dot best" />
                                <span>{t.compare?.less || 'Less'}</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot worse" />
                                <span>{t.compare?.more || 'More'}</span>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="loading">
                            <div className="spinner" />
                            <p style={{ color: '#888', fontSize: 14, margin: 0 }}>{t.compare?.loading || 'Loading...'}</p>
                        </div>
                    ) : (
                        <div className="comparison-table-wrap">
                            <table className="comparison-table">
                                <thead>
                                    <tr>
                                        <th className="param-col" />
                                        {selectedAdverts.map(advert => (
                                            <th key={advert.id}>
                                                <div className="advert-header">
                                                    <div className="advert-image-wrap">
                                                        <img src={advert.imageUrl} alt={advert.title} />
                                                        <button className="remove-btn" onClick={() => removeFromComparison(advert.id)}>×</button>
                                                    </div>
                                                    <h3>{advert.title}</h3>
                                                    <p className="address">{advert.address}</p>
                                                    <p className="price">{advert.price.toLocaleString()} грн/міс &nbsp;·&nbsp; {advert.area} м²</p>
                                                    <button className="btn-details" onClick={() => navigate(`/warehouse/${advert.id}`)}>
                                                        {t.compare?.details || 'Details'} →
                                                    </button>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="param-name">{t.compare?.price || 'Price'}</td>
                                        {selectedAdverts.map(a => (
                                            <td key={a.id} className={getCellClass('price', a.price)}>
                                                <strong>{a.price.toLocaleString()} грн</strong>
                                                {isTwoAdverts && getCellClass('price', a.price) === 'cell-best' &&
                                                    <span className="badge">{t.compare?.less || 'Less'}</span>}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="param-name">{t.compare?.area || 'Area'}</td>
                                        {selectedAdverts.map(a => (
                                            <td key={a.id} className={getCellClass('area', a.area)}>
                                                <strong>{a.area} м²</strong>
                                                {isTwoAdverts && getCellClass('area', a.area) === 'cell-best' &&
                                                    <span className="badge">{t.compare?.more || 'More'}</span>}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="param-name">{t.compare?.floor || 'Floor'}</td>
                                        {selectedAdverts.map(a => (
                                            <td key={a.id}>{a.floor || '—'}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="param-name">{t.compare?.buildingType || 'Building type'}</td>
                                        {selectedAdverts.map(a => (
                                            <td key={a.id}>{a.buildingType}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="param-name">{t.compare?.city || 'City'}</td>
                                        {selectedAdverts.map(a => (
                                            <td key={a.id}>{a.city}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="param-name">{t.compare?.communications || 'Communications'}</td>
                                        {isTwoAdverts ? (
                                            <td colSpan="2">
                                                <ComparisonFeatures items1={selectedAdverts[0].communications} items2={selectedAdverts[1].communications} />
                                            </td>
                                        ) : selectedAdverts.map(a => (
                                            <td key={a.id}>
                                                {a.communications.length === 0
                                                    ? <span style={{ fontSize: 13, color: '#bbb' }}>—</span>
                                                    : <ul className="features-list">{a.communications.map((item, i) => <li key={i}>{item}</li>)}</ul>}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="param-name">{t.compare?.appliances || 'Appliances'}</td>
                                        {isTwoAdverts ? (
                                            <td colSpan="2">
                                                <ComparisonFeatures items1={selectedAdverts[0].appliances} items2={selectedAdverts[1].appliances} />
                                            </td>
                                        ) : selectedAdverts.map(a => (
                                            <td key={a.id}>
                                                {a.appliances.length === 0
                                                    ? <span style={{ fontSize: 13, color: '#bbb' }}>—</span>
                                                    : <ul className="features-list">{a.appliances.map((item, i) => <li key={i}>{item}</li>)}</ul>}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="param-name">{t.compare?.infrastructure || 'Infrastructure'}</td>
                                        {isTwoAdverts ? (
                                            <td colSpan="2">
                                                <ComparisonFeatures items1={selectedAdverts[0].infrastructure} items2={selectedAdverts[1].infrastructure} />
                                            </td>
                                        ) : selectedAdverts.map(a => (
                                            <td key={a.id}>
                                                {a.infrastructure.length === 0
                                                    ? <span style={{ fontSize: 13, color: '#bbb' }}>—</span>
                                                    : <ul className="features-list">{a.infrastructure.map((item, i) => <li key={i}>{item}</li>)}</ul>}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Compare;