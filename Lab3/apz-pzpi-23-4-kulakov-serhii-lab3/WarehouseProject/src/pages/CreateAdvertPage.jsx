import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdvert } from '../services/advertService';
import Header from "../components/Header";
import Footer from "../components/Footer";
import '../styles/CreateAdvert.css';
import { useTranslation } from '../hooks/useTranslation';

function CreateAdvert() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    const [advertData, setAdvertData] = useState({
        title: '',
        description: '',
        address: '',
        price: '',
        area: '',
        floor: '',
        buildingType: '',
        city: '',
        communications: [],
        appliances: [],
        infrastructure: []
    });

    const [photos, setPhotos] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const buildingTypes = [
        t.createAdvert.buildingTypes.box,
        t.createAdvert.buildingTypes.hangar,
        t.createAdvert.buildingTypes.officeWarehouse,
        t.createAdvert.buildingTypes.industrialWarehouse,
        t.createAdvert.buildingTypes.terminal,
        t.createAdvert.buildingTypes.refrigeratedWarehouse
    ];

    const cities = [
        t.createAdvert.cities.kyiv,
        t.createAdvert.cities.odesa,
        t.createAdvert.cities.lviv,
        t.createAdvert.cities.kharkiv,
        t.createAdvert.cities.dnipro,
        t.createAdvert.cities.zaporizhzhia,
        t.createAdvert.cities.vinnytsia,
        t.createAdvert.cities.zhytomyr,
        t.createAdvert.cities.chernihiv
    ];

    const communicationOptions = [
        { id: t.createAdvert.communicationOptions.electricity, label: t.createAdvert.communicationOptions.electricity },
        { id: t.createAdvert.communicationOptions.waterSupply, label: t.createAdvert.communicationOptions.waterSupply },
        { id: t.createAdvert.communicationOptions.sewerage, label: t.createAdvert.communicationOptions.sewerage },
        { id: t.createAdvert.communicationOptions.heating, label: t.createAdvert.communicationOptions.heating },
        { id: t.createAdvert.communicationOptions.ventilation, label: t.createAdvert.communicationOptions.ventilation },
        { id: t.createAdvert.communicationOptions.internet, label: t.createAdvert.communicationOptions.internet }
    ];

    const applianceOptions = [
        { id: t.createAdvert.applianceOptions.airConditioner, label: t.createAdvert.applianceOptions.airConditioner },
        { id: t.createAdvert.applianceOptions.securitySystem, label: t.createAdvert.applianceOptions.securitySystem },
        { id: t.createAdvert.applianceOptions.surveillance, label: t.createAdvert.applianceOptions.surveillance },
        { id: t.createAdvert.applianceOptions.fireExtinguishers, label: t.createAdvert.applianceOptions.fireExtinguishers }
    ];

    const infrastructureOptions = [
        { id: t.createAdvert.infrastructureOptions.parking, label: t.createAdvert.infrastructureOptions.parking },
        { id: t.createAdvert.infrastructureOptions.freightElevator, label: t.createAdvert.infrastructureOptions.freightElevator },
        { id: t.createAdvert.infrastructureOptions.ramp, label: t.createAdvert.infrastructureOptions.ramp },
        { id: t.createAdvert.infrastructureOptions.security, label: t.createAdvert.infrastructureOptions.security },
        { id: t.createAdvert.infrastructureOptions.showers, label: t.createAdvert.infrastructureOptions.showers },
        { id: t.createAdvert.infrastructureOptions.canteen, label: t.createAdvert.infrastructureOptions.canteen }
    ];

    const handleInputChange = (field, value) => {
        setAdvertData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleMultiSelectChange = (field, optionId, isChecked) => {
        setAdvertData(prev => {
            const currentValues = [...prev[field]];
            
            if (isChecked) {
                if (!currentValues.includes(optionId)) {
                    return {
                        ...prev,
                        [field]: [...currentValues, optionId]
                    };
                }
            } else {
                return {
                    ...prev,
                    [field]: currentValues.filter(id => id !== optionId)
                };
            }
            
            return prev;
        });
    };

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length + photos.length > 10) {
            alert(t.createAdvert.maxPhotosAlert);
            return;
        }
        
        const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            alert(t.createAdvert.maxSizeAlert);
            return;
        }
        
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));
        if (invalidFiles.length > 0) {
            alert(t.createAdvert.invalidTypeAlert);
            return;
        }
        
        setPhotos(prev => [...prev, ...files]);
    };

    const handleRemovePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errors = [];
        
        if (!advertData.title.trim()) errors.push(t.createAdvert.titleRequired);
        if (!advertData.description.trim()) errors.push(t.createAdvert.descriptionRequired);
        if (!advertData.address.trim()) errors.push(t.createAdvert.addressRequired);
        if (!advertData.price || advertData.price <= 0) errors.push(t.createAdvert.priceRequired);
        if (!advertData.area || advertData.area <= 0) errors.push(t.createAdvert.areaRequired);
        if (!advertData.buildingType) errors.push(t.createAdvert.buildingTypeRequired);
        if (!advertData.city) errors.push(t.createAdvert.cityRequired);
        
        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }
        
        setIsSubmitting(true);
        setUploadProgress(0);
        
        try {
            console.log('Creating advert with photos...');
            const result = await createAdvert(advertData, photos);
            console.log('Advert created:', result);
            
            alert(t.createAdvert.success);
            navigate('/profile');
            
        } catch (error) {
            console.error('Error:', error);
            
            if (error.message.includes('401')) {
                alert(t.createAdvert.error401);
                navigate('/login');
            } else if (error.message.includes('400')) {
                alert(t.createAdvert.error400);
            } else if (error.message.includes('NetworkError')) {
                alert(t.createAdvert.networkError);
            } else {
                alert(error.message || t.createAdvert.createError);
            }
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    const handleReset = () => {
        if (window.confirm(t.createAdvert.confirmReset)) {
            setAdvertData({
                title: '',
                description: '',
                address: '',
                price: '',
                area: '',
                floor: '',
                buildingType: '',
                city: '',
                communications: [],
                appliances: [],
                infrastructure: []
            });
            setPhotos([]);
        }
    };

    return (
        <>
            <Header />
            <div className="create-advert-page">
                <div className="create-advert-container">
                    <h1 className="create-advert-title">{t.createAdvert.title}</h1>
                    
                    <form onSubmit={handleSubmit} className="advert-form">
                        <div className="form-section compact">
                            <h2 className="section-title">{t.createAdvert.mainInfo}</h2>
                            
                            <div className="form-grid-compact">
                                <div className="form-group">
                                    <label className="form-label required">{t.createAdvert.title}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={advertData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder={t.createAdvert.titlePlaceholder}
                                        required
                                        maxLength="100"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">{t.createAdvert.address}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={advertData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        placeholder={t.createAdvert.addressPlaceholder}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">{t.createAdvert.price}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={advertData.price}
                                        onChange={(e) => handleInputChange('price', e.target.value)}
                                        placeholder={t.createAdvert.pricePlaceholder}
                                        min="0"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">{t.createAdvert.area}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={advertData.area}
                                        onChange={(e) => handleInputChange('area', e.target.value)}
                                        placeholder={t.createAdvert.areaPlaceholder}
                                        min="1"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t.createAdvert.floor}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={advertData.floor}
                                        onChange={(e) => handleInputChange('floor', e.target.value)}
                                        placeholder={t.createAdvert.floorPlaceholder}
                                        min="-5"
                                        max="100"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">{t.createAdvert.buildingType}</label>
                                    <select
                                        className="form-select"
                                        value={advertData.buildingType}
                                        onChange={(e) => handleInputChange('buildingType', e.target.value)}
                                        required
                                    >
                                        <option value="">{t.createAdvert.buildingType}</option>
                                        {buildingTypes.map((type, index) => (
                                            <option key={index} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">{t.createAdvert.city}</label>
                                    <select
                                        className="form-select"
                                        value={advertData.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                        required
                                    >
                                        <option value="">{t.createAdvert.city}</option>
                                        {cities.map((city, index) => (
                                            <option key={index} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label required">{t.createAdvert.description}</label>
                                    <textarea
                                        className="form-textarea compact"
                                        value={advertData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder={t.createAdvert.descriptionPlaceholder}
                                        rows="3"
                                        required
                                        maxLength="2000"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="form-section compact">
                            <h2 className="section-title">{t.createAdvert.additionalFeatures}</h2>
                            
                            <div className="characteristics-grid">
                                <div className="char-block">
                                    <h3 className="char-subtitle">{t.createAdvert.communications}</h3>
                                    <div className="checkbox-compact-grid">
                                        {communicationOptions.map(option => (
                                            <label key={option.id} className="checkbox-compact">
                                                <input
                                                    type="checkbox"
                                                    checked={advertData.communications.includes(option.id)}
                                                    onChange={(e) => handleMultiSelectChange('communications', option.id, e.target.checked)}
                                                />
                                                <span>{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="char-block">
                                    <h3 className="char-subtitle">{t.createAdvert.appliances}</h3>
                                    <div className="checkbox-compact-grid">
                                        {applianceOptions.map(option => (
                                            <label key={option.id} className="checkbox-compact">
                                                <input
                                                    type="checkbox"
                                                    checked={advertData.appliances.includes(option.id)}
                                                    onChange={(e) => handleMultiSelectChange('appliances', option.id, e.target.checked)}
                                                />
                                                <span>{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="char-block">
                                    <h3 className="char-subtitle">{t.createAdvert.infrastructure}</h3>
                                    <div className="checkbox-compact-grid">
                                        {infrastructureOptions.map(option => (
                                            <label key={option.id} className="checkbox-compact">
                                                <input
                                                    type="checkbox"
                                                    checked={advertData.infrastructure.includes(option.id)}
                                                    onChange={(e) => handleMultiSelectChange('infrastructure', option.id, e.target.checked)}
                                                />
                                                <span>{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="form-section compact">
                            <h2 className="section-title">{t.createAdvert.photos}</h2>
                            
                            <div className="photo-section-compact">
                                <label htmlFor="photo-upload" className="photo-upload-compact">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="17 8 12 3 7 8"/>
                                        <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    <span>{t.createAdvert.selectPhotos}</span>
                                    <input
                                        id="photo-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/jpg"
                                        multiple
                                        onChange={handlePhotoUpload}
                                        className="file-input"
                                    />
                                </label>
                                
                                <div className="photo-info">
                                    <p className="photo-hint">{t.createAdvert.photoHint}</p>
                                    <p className="photo-count">{t.createAdvert.photosSelected.replace('{count}', photos.length)}</p>
                                </div>
                                
                                {photos.length > 0 && (
                                    <div className="preview-grid-compact">
                                        {photos.map((photo, index) => (
                                            <div key={index} className="preview-item-compact">
                                                <img 
                                                    src={URL.createObjectURL(photo)} 
                                                    alt={`${t.createAdvert.title} ${index + 1}`}
                                                />
                                                <div className="photo-info-overlay">
                                                    <span>{(photo.size / (1024 * 1024)).toFixed(2)} MB</span>
                                                </div>
                                                <button 
                                                    type="button"
                                                    className="remove-photo-compact"
                                                    onClick={() => handleRemovePhoto(index)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>


                        {isSubmitting && (
                            <div className="upload-progress">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                                <p className="progress-text">
                                    {t.createAdvert.publishing} {uploadProgress}%
                                </p>
                            </div>
                        )}


                        <div className="form-actions-compact">
                            <button 
                                type="submit" 
                                className="submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? t.createAdvert.publishing : t.createAdvert.publish}
                            </button>
                            <button 
                                type="button" 
                                className="reset-btn"
                                onClick={handleReset}
                                disabled={isSubmitting}
                            >
                                {t.createAdvert.reset}
                            </button>
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={() => navigate('/profile')}
                                disabled={isSubmitting}
                            >
                                {t.createAdvert.cancel}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default CreateAdvert;