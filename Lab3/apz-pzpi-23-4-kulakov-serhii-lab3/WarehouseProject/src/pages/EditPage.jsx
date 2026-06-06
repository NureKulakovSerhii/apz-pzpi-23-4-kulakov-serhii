import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getAdvertById } from '../services/advertService';
import { updateAdvert } from '../services/profileSevice';
import '../styles/EditPage.css';
import { useTranslation } from '../hooks/useTranslation';

function EditPage() {
    const { advertId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        updateWarehouseDto: {
            pricePerMonth: 0,
            communications: [],
            householdAppliances: [],
            infrastructures: []
        }
    });

    useEffect(() => {
        const loadAdvertData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const data = await getAdvertById(advertId);
                
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    updateWarehouseDto: {
                        pricePerMonth: data.warehouse?.pricePerMonth || 0,
                        communications: data.warehouse?.communications || [],
                        householdAppliances: data.warehouse?.householdAppliances || [],
                        infrastructures: data.warehouse?.infrastructures || []
                    }
                });
                
            } catch (error) {
                console.error('Error loading advert:', error);
                setError(error.message || t.editAdvert.loadError);
            } finally {
                setLoading(false);
            }
        };
        
        loadAdvertData();
    }, [advertId, t]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePriceChange = (e) => {
        const value = parseFloat(e.target.value) || 0;
        setFormData(prev => ({
            ...prev,
            updateWarehouseDto: {
                ...prev.updateWarehouseDto,
                pricePerMonth: value
            }
        }));
    };

    const handleArrayChange = (arrayName, value, isChecked) => {
        setFormData(prev => {
            const currentArray = [...prev.updateWarehouseDto[arrayName]];
            
            if (isChecked) {
                if (!currentArray.includes(value)) {
                    currentArray.push(value);
                }
            } else {
                const index = currentArray.indexOf(value);
                if (index > -1) {
                    currentArray.splice(index, 1);
                }
            }
            
            return {
                ...prev,
                updateWarehouseDto: {
                    ...prev.updateWarehouseDto,
                    [arrayName]: currentArray
                }
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            alert(t.editAdvert.titleRequired);
            return;
        }
        
        if (!formData.description.trim()) {
            alert(t.editAdvert.descriptionRequired);
            return;
        }
        
        if (formData.updateWarehouseDto.pricePerMonth <= 0) {
            alert(t.editAdvert.priceRequired);
            return;
        }
        
        try {
            setSaving(true);
            
            const updatePayload = {
                title: formData.title,
                description: formData.description,
                updateWarehouseDto: {
                    pricePerMonth: formData.updateWarehouseDto.pricePerMonth,
                    communications: formData.updateWarehouseDto.communications,
                    householdAppliances: formData.updateWarehouseDto.householdAppliances,
                    infrastructures: formData.updateWarehouseDto.infrastructures
                }
            };
            
            await updateAdvert(advertId, updatePayload);
            
            alert(t.editAdvert.updateSuccess);
            navigate('/profile');
            
        } catch (error) {
            console.error('Error updating advert:', error);
            alert(`${t.editAdvert.updateError}: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm(t.editAdvert.confirmCancel)) {
            navigate('/profile');
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="edit-advert-page">
                    <div className="edit-advert-container">
                        <div className="loading-message">
                            <div className="loading-spinner"></div>
                            <p>{t.editAdvert.loading}</p>
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
                <div className="edit-advert-page">
                    <div className="edit-advert-container">
                        <div className="error-message">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            <h3 className="error-title">{t.editAdvert.errorTitle}</h3>
                            <p className="error-text">{error}</p>
                            <div className="button-group">
                                <button 
                                    className="retry-btn"
                                    onClick={() => window.location.reload()}
                                >
                                    {t.editAdvert.retry}
                                </button>
                                <button 
                                    className="back-btn"
                                    onClick={() => navigate('/profile')}
                                >
                                    {t.editAdvert.backToProfileBtn}
                                </button>
                            </div>
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
            <div className="edit-advert-page">
                <div className="edit-advert-container">
                    <div className="page-header">
                        <h1 className="page-title">{t.editAdvert.pageTitle}</h1>
                        <div className="page-info">
                            <span className="advert-id">{t.editAdvert.advertId.replace('{id}', advertId)}</span>
                            <button 
                                className="back-to-profile-btn"
                                onClick={() => navigate('/profile')}
                            >
                                ← {t.editAdvert.backToProfile}
                            </button>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="edit-advert-form">
                        <div className="form-section">
                            <h2 className="section-title">{t.editAdvert.mainInfo}</h2>
                            
                            <div className="form-group">
                                <label htmlFor="title" className="form-label">
                                    {t.editAdvert.title}
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                    disabled={saving}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="description" className="form-label">
                                    {t.editAdvert.description}
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="form-textarea"
                                    rows="6"
                                    required
                                    disabled={saving}
                                />
                            </div>
                        </div>
                        
                        <div className="form-section">
                            <h2 className="section-title">{t.editAdvert.warehouseInfo}</h2>
                            
                            <div className="form-group">
                                <label htmlFor="pricePerMonth" className="form-label">
                                    {t.editAdvert.pricePerMonth}
                                </label>
                                <input
                                    type="number"
                                    id="pricePerMonth"
                                    value={formData.updateWarehouseDto.pricePerMonth}
                                    onChange={handlePriceChange}
                                    className="form-input"
                                    min="1"
                                    step="1"
                                    required
                                    disabled={saving}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">{t.editAdvert.communications}</label>
                                <div className="checkbox-group">
                                    {[0, 1, 2, 3, 4].map(value => (
                                        <label key={`comm-${value}`} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.updateWarehouseDto.communications.includes(value)}
                                                onChange={(e) => handleArrayChange('communications', value, e.target.checked)}
                                                disabled={saving}
                                            />
                                            <span className="checkbox-text">
                                                {t.editAdvert.communication.replace('{value}', value)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">{t.editAdvert.appliances}</label>
                                <div className="checkbox-group">
                                    {[0, 1, 2, 3].map(value => (
                                        <label key={`app-${value}`} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.updateWarehouseDto.householdAppliances.includes(value)}
                                                onChange={(e) => handleArrayChange('householdAppliances', value, e.target.checked)}
                                                disabled={saving}
                                            />
                                            <span className="checkbox-text">
                                                {t.editAdvert.appliance.replace('{value}', value)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">{t.editAdvert.infrastructure}</label>
                                <div className="checkbox-group">
                                    {[0, 1, 2, 3, 4, 5].map(value => (
                                        <label key={`infra-${value}`} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.updateWarehouseDto.infrastructures.includes(value)}
                                                onChange={(e) => handleArrayChange('infrastructures', value, e.target.checked)}
                                                disabled={saving}
                                            />
                                            <span className="checkbox-text">
                                                {t.editAdvert.infrastructure.replace('{value}', value)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="submit-btn"
                                disabled={saving}
                            >
                                {saving ? t.editAdvert.saving : t.editAdvert.save}
                            </button>
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                {t.editAdvert.cancel}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default EditPage;