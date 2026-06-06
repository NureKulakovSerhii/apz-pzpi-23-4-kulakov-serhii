import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { jwtDecode } from 'jwt-decode';
import '../styles/Header.css';
import { useTranslation } from '../hooks/useTranslation';
import { useState, useEffect } from 'react';

function Header() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const isLoggedIn = isAuthenticated();
    const [isModerator, setIsModerator] = useState(false);
     
    useEffect(() => {
        if (isLoggedIn) {
            try {
                const token = localStorage.getItem('access_token');
                const decoded = jwtDecode(token);
                let userRoles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
                if (typeof userRoles === 'string') {
                    userRoles = [userRoles];
                }
                setIsModerator(Array.isArray(userRoles) && userRoles.includes('Moderator'));
            } catch (error) {
                console.error('Error checking moderator role:', error);
            }
        }
    }, [isLoggedIn]);
     
    const handleProtectedRoute = (route) => {
        if (isLoggedIn) {
            navigate(route);
        } else {
            alert(t.header.loginRequired);
            navigate('/login'); 
        }
    };
    
    const navItems = [
        { path: '/', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', label: t.header.home, isProtected: false },
        { path: '/search', icon: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z', label: t.header.searchWarehouses, isProtected: false },
        { path: '/support', icon: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z', label: t.header.supportService, isProtected: true },
        { path: '/compare', icon: 'M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-2v2zm0 15H5l5-6v6zm9-15h-5v2h5v13l-5-6v9h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z', label: t.header.comparison, isProtected: true },
        { path: '/favorites', icon: 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z', label: t.header.favorites, isProtected: true },
        { path: '/profile', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', label: t.header.profile, isProtected: true },
    ];
    
    const handleNavigation = (item) => {
        if (item.isProtected) {
            handleProtectedRoute(item.path);
        } else {
            navigate(item.path);
        }
    };
    
    return (
        <header className="header">
            <div className="header-content">
                <nav className="header-nav">
                    {navItems.map((item, index) => (
                        <div key={index} className="header-item" onClick={() => handleNavigation(item)}>
                            <span className="header-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d={item.icon}/>
                                </svg>
                            </span>
                            <span className="header-text">{item.label}</span>
                        </div>
                    ))}
                    {isModerator && (
                        <div className="header-item admin-item" onClick={() => navigate('/admin')}>
                            <span className="header-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                                </svg>
                            </span>
                            <span className="header-text">{t.header.adminPanel}</span>
                        </div>
                    )}
                </nav>
                
                <button 
                    className="create-advert-btn"
                    onClick={() => handleProtectedRoute('/create-advert')}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    {t.header.createAdvert}
                </button>
            </div>
        </header>
    );
}

export default Header;