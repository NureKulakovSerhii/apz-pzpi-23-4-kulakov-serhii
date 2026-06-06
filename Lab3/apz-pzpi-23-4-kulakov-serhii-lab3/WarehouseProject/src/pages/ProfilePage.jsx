import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import AdvertCard from "../components/AdvertCard";
import { getUserProfile, updateUserProfile, deleteAdvert } from '../services/profileSevice';
import { 
    getReverseBuildingTypeMap,
    getReverseCityMap
} from '../constants/mapping';
import { useTheme, useLanguage, useRegion } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/Profile.css';

const settingsService = {
    exportSettings() {
        const settings = {
            theme: localStorage.getItem('theme') || 'light',
            language: localStorage.getItem('language') || 'uk',
            timezone: localStorage.getItem('timezone') || 'Europe/Kyiv',
            dateFormat: localStorage.getItem('dateFormat') || 'DD.MM.YYYY',
            exportedAt: new Date().toISOString()
        };
        
        const json = JSON.stringify(settings, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `settings_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    importSettings(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const settings = JSON.parse(e.target.result);
                    
                    if (settings.theme) {
                        localStorage.setItem('theme', settings.theme);
                        document.documentElement.setAttribute('data-theme', settings.theme);
                    }
                    if (settings.language) {
                        localStorage.setItem('language', settings.language);
                        document.documentElement.setAttribute('lang', settings.language);
                    }
                    if (settings.timezone) {
                        localStorage.setItem('timezone', settings.timezone);
                    }
                    if (settings.dateFormat) {
                        localStorage.setItem('dateFormat', settings.dateFormat);
                    }
                    
                    resolve(settings);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
};

function SettingsSection({ t, onSettingsImported }) {
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage } = useLanguage();
    const { timezone, setTimezone, dateFormat, setDateFormat, TIMEZONES, DATE_FORMATS } = useRegion();
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef(null);

    const handleExport = () => {
        settingsService.exportSettings();
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        setImporting(true);
        try {
            const settings = await settingsService.importSettings(file);
            alert(t.profile.importSuccess);
            
            if (onSettingsImported) {
                onSettingsImported();
            }
            
            if (settings.language && settings.language !== language) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Import error:', error);
            alert(t.profile.importError);
        } finally {
            setImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="profile-section">
            <div className="section-header">
                <div className="section-title-wrapper">
                    <h2 className="section-title">{t.profile.settings}</h2>
                </div>
            </div>

            <div className="settings-grid">
                <div className="settings-item">
                    <span className="settings-label">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM11 1h2v3h-2zm0 19h2v3h-2zM3.515 4.929l1.414-1.414 2.121 2.12-1.414 1.415zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414zM1 11h3v2H1zm19 0h3v2h-3zM4.929 20.485l-1.414-1.414 2.12-2.121 1.415 1.414zM18.364 7.05l-1.414-1.414 2.121-2.121 1.414 1.414z"/>
                        </svg>
                        {t.profile.theme}
                    </span>
                    <div className="theme-toggle-group">
                        <button
                            className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                            onClick={() => theme !== 'light' && toggleTheme()}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM11 1h2v3h-2zm0 19h2v3h-2zM3.515 4.929l1.414-1.414 2.121 2.12-1.414 1.415zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414zM1 11h3v2H1zm19 0h3v2h-3zM4.929 20.485l-1.414-1.414 2.12-2.121 1.415 1.414zM18.364 7.05l-1.414-1.414 2.121-2.121 1.414 1.414z"/>
                            </svg>
                            {t.profile.themeLight}
                        </button>
                        <button
                            className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                            onClick={() => theme !== 'dark' && toggleTheme()}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
                            </svg>
                            {t.profile.themeDark}
                        </button>
                    </div>
                </div>

                <div className="settings-item">
                    <span className="settings-label">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                        </svg>
                        {t.profile.languageLabel}
                    </span>
                    <div className="lang-toggle-group">
                        <button
                            className={`lang-btn ${language === 'uk' ? 'active' : ''}`}
                            onClick={() => setLanguage('uk')}
                        >
                            <span className="lang-flag">🇺🇦</span>
                            <span className="lang-name">Українська</span>
                        </button>
                        <button
                            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                            onClick={() => setLanguage('en')}
                        >
                            <span className="lang-flag">🇬🇧</span>
                            <span className="lang-name">English</span>
                        </button>
                    </div>
                </div>

                <div className="settings-item">
                    <span className="settings-label">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                        </svg>
                        {t.profile.timezone}
                    </span>
                    <select 
                        className="region-select" 
                        value={timezone} 
                        onChange={(e) => setTimezone(e.target.value)}
                    >
                        {Object.entries(TIMEZONES).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className="settings-item">
                    <span className="settings-label">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10z"/>
                        </svg>
                        {t.profile.dateFormat}
                    </span>
                    <select 
                        className="region-select" 
                        value={dateFormat} 
                        onChange={(e) => setDateFormat(e.target.value)}
                    >
                        {Object.entries(DATE_FORMATS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
                <div className="settings-item import-export-item">
                    <span className="settings-label">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm4 12h-4v3l-5-5 5-5v3h4v4z"/>
                        </svg>
                        {t.profile.backupSettings}
                    </span>
                    <div className="import-export-group">
                        <button 
                            className="export-settings-btn"
                            onClick={handleExport}
                        >
                            {t.profile.exportSettings}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".json"
                            onChange={handleImport}
                            style={{ display: 'none' }}
                        />
                        <button 
                            className="import-settings-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={importing}
                        >
                            {importing ? t.profile.importing : t.profile.importSettings}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Profile() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { formatDate: regionFormatDate } = useRegion();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [userAdverts, setUserAdverts] = useState([]);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    
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

    const [editedInfo, setEditedInfo] = useState({
        name: '',
        surname: '',
        phoneNumber: '',
        secondPhoneNumber: ''
    });

    useEffect(() => { loadProfileData(); }, []);

    const formatDate = (dateString) => {
        return regionFormatDate(dateString);
    };

    const loadProfileData = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getUserProfile();
            setProfileData(data);

            const transformedAdverts = (data.userAdverts || []).map(advert => ({
                id: advert.id,
                title: advert.title,
                description: advert.description,
                address: advert.warehouse?.address || t.profile.notSpecified,
                scale: advert.warehouse?.scale || 0,
                price: advert.warehouse?.pricePerMonth || 0,
                floor: advert.warehouse?.floor || 0,
                buildingType: REVERSE_BUILDING_TYPE_MAP[advert.warehouse?.buildingType] || '',
                city: REVERSE_CITY_MAP[advert.warehouse?.city] || '',
                imageUrl: advert.warehouse.imageUrl,
                createdAt: advert.createdAt,
                isActive: advert.isActive,
                author: advert.author,
                communications: advert.warehouse?.communications || [],
                householdAppliances: advert.warehouse?.householdAppliances || [],
                infrastructures: advert.warehouse?.infrastructures || []
            }));

            setUserAdverts(transformedAdverts);
            setEditedInfo({
                name: data.name || '',
                surname: data.surname || '',
                phoneNumber: data.phoneNumber || '',
                secondPhoneNumber: data.secondPhoneNumber || ''
            });
        } catch (err) {
            console.error('Profile load error:', err);
            setError(err.message || t.profile.errorTitle);
            setProfileData(null);
            setUserAdverts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const updatedData = await updateUserProfile(editedInfo);
            setProfileData(prev => ({ ...prev, ...updatedData, ...editedInfo }));
            setIsEditing(false);
            alert(t.profile.profileUpdated);
        } catch (err) {
            alert(`${t.profile.profileUpdateError}: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (profileData) {
            setEditedInfo({
                name: profileData.name || '',
                surname: profileData.surname || '',
                phoneNumber: profileData.phoneNumber || '',
                secondPhoneNumber: profileData.secondPhoneNumber || ''
            });
        }
    };

    const handleChange = (field, value) => {
        setEditedInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleDeleteAdvert = async (advertId, e) => {
        e.stopPropagation();
        if (!window.confirm(t.profile.deleteConfirm)) return;
        try {
            setDeletingId(advertId);
            await deleteAdvert(advertId);
            setUserAdverts(prev => prev.filter(a => a.id !== advertId));
            alert(t.profile.deleteSuccess);
        } catch (err) {
            alert(`${t.profile.deleteError}: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    const handleSettingsImported = () => {
        loadProfileData();
    };

    if (loading) return (
        <>
            <Header />
            <div className="profile-page loading">
                <div className="profile-container">
                    <div className="profile-header">
                        <h1 className="profile-title">{t.profile.title}</h1>
                    </div>
                    <div className="loading-message">
                        <div className="loading-spinner" />
                        <p>{t.profile.loading}</p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );

    if (error) return (
        <>
            <Header />
            <div className="profile-page error">
                <div className="profile-container">
                    <div className="profile-header">
                        <h1 className="profile-title">{t.profile.title}</h1>
                    </div>
                    <div className="error-message">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <h3 className="error-title">{t.profile.errorTitle}</h3>
                        <p className="error-text">{error}</p>
                        <button className="retry-btn" onClick={loadProfileData}>
                            {t.profile.retry}
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );

    return (
        <>
            <Header />
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-header">
                        <div className="profile-title-section">
                            <h1 className="profile-title">{t.profile.title}</h1>
                        </div>
                    </div>

                    <SettingsSection t={t} onSettingsImported={handleSettingsImported} />

                    <div className="profile-section">
                        <div className="section-header">
                            <div className="section-title-wrapper">
                                <h2 className="section-title">{t.profile.mainInfo}</h2>
                            </div>
                            {!isEditing && (
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                                    {t.profile.edit}
                                </button>
                            )}
                        </div>

                        <div className="info-grid">
                            <div className="info-item">
                                <label className="info-label">{t.profile.name}</label>
                                {isEditing ? (
                                    <input className="info-input" type="text"
                                        value={editedInfo.name}
                                        onChange={e => handleChange('name', e.target.value)}
                                        placeholder={t.profile.namePlaceholder}
                                        disabled={saving} />
                                ) : (
                                    <p className="info-value">{profileData?.name || t.profile.notSpecified}</p>
                                )}
                            </div>

                            <div className="info-item">
                                <label className="info-label">{t.profile.surname}</label>
                                {isEditing ? (
                                    <input className="info-input" type="text"
                                        value={editedInfo.surname}
                                        onChange={e => handleChange('surname', e.target.value)}
                                        placeholder={t.profile.surnamePlaceholder}
                                        disabled={saving} />
                                ) : (
                                    <p className="info-value">{profileData?.surname || t.profile.notSpecified}</p>
                                )}
                            </div>

                            <div className="info-item">
                                <label className="info-label">{t.profile.secondPhone}</label>
                                {isEditing ? (
                                    <input className="info-input" type="tel"
                                        value={editedInfo.secondPhoneNumber}
                                        onChange={e => handleChange('secondPhoneNumber', e.target.value)}
                                        placeholder={t.profile.secondPhonePlaceholder}
                                        disabled={saving} />
                                ) : (
                                    <p className="info-value">{profileData?.secondPhoneNumber || t.profile.notSpecified}</p>
                                )}
                            </div>

                            <div className="info-item">
                                <label className="info-label">{t.profile.phone}</label>
                                {isEditing ? (
                                    <input className="info-input" type="tel"
                                        value={editedInfo.phoneNumber}
                                        onChange={e => handleChange('phoneNumber', e.target.value)}
                                        placeholder={t.profile.phonePlaceholder}
                                        disabled={saving} />
                                ) : (
                                    <p className="info-value">{profileData?.phoneNumber || t.profile.notSpecified}</p>
                                )}
                            </div>

                            <div className="info-item">
                                <label className="info-label">{t.profile.email}</label>
                                <p className="info-value disabled">{profileData?.email || t.profile.notSpecified}</p>
                            </div>

                            <div className="info-item">
                                <label className="info-label">{t.profile.userId}</label>
                                <p className="info-value disabled small">{profileData?.id || t.profile.notSpecified}</p>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="edit-actions">
                                <button className="save-btn" onClick={handleSave} disabled={saving}>
                                    {saving ? t.profile.saving : t.profile.save}
                                </button>
                                <button className="cancel-btn" onClick={handleCancel} disabled={saving}>
                                    {t.profile.cancel}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="profile-section">
                        <div className="section-header">
                            <div className="section-title-wrapper">
                                <h2 className="section-title">{t.profile.myAdverts}</h2>
                            </div>
                            <div className="adverts-count">
                                <span className="count-badge">{userAdverts.length}</span>
                                <span className="count-text">{t.profile.advertsCount}</span>
                            </div>
                        </div>

                        {userAdverts.length === 0 ? (
                            <div className="empty-adverts">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="1">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                    <polyline points="17 21 17 13 7 13 7 21"/>
                                    <polyline points="7 3 7 8 15 8"/>
                                </svg>
                                <h3 className="empty-title">{t.profile.noAdverts}</h3>
                                <p className="empty-text">{t.profile.noAdvertsText}</p>
                                <button className="create-advert-btn" onClick={() => navigate('/create-advert')}>
                                    {t.profile.createAdvert}
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="adverts-grid">
                                    {userAdverts.map(advert => (
                                        <div key={advert.id} className="user-advert-card">
                                            <div className="advert-card-wrapper"
                                                onClick={() => navigate(`/warehouse/${advert.id}`)}>
                                                <AdvertCard advert={advert} />
                                            </div>

                                            <div className="advert-status">
                                                <span className={`status-badge ${advert.isActive ? 'active' : 'inactive'}`}>
                                                    {advert.isActive ? t.profile.active : t.profile.inactive}
                                                </span>
                                                <span className="advert-date">
                                                    {formatDate(advert.createdAt)}
                                                </span>
                                            </div>

                                            <div className="advert-actions">
                                                <button className="edit-advert-btn"
                                                    onClick={e => { e.stopPropagation(); navigate(`/edit-page/${advert.id}`); }}
                                                    disabled={deletingId === advert.id}>
                                                    {t.profile.editAdvert}
                                                </button>
                                                <button className="delete-advert-btn"
                                                    onClick={e => handleDeleteAdvert(advert.id, e)}
                                                    disabled={deletingId === advert.id}>
                                                    {deletingId === advert.id ? t.profile.deleting : t.profile.deleteAdvert}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="adverts-footer">
                                    <button className="view-all-btn" onClick={() => navigate('/search')}>
                                        {t.profile.viewAll}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Profile;