import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";
import '../styles/AdminPanel.css';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from '../hooks/useTranslation';

function AdminPanel() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkModeratorRole = () => {
            try {
                const token = localStorage.getItem('access_token');
                
                if (!token) {
                    alert(t.adminPanel.loginRequired);
                    navigate('/login');
                    return;
                }

                const decoded = jwtDecode(token);
                
                let userRoles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
                
                if (typeof userRoles === 'string') {
                    userRoles = [userRoles];
                }
                
                const hasModeratorRole = Array.isArray(userRoles) && userRoles.includes('Moderator');
                
                if (!hasModeratorRole) {
                    alert(t.adminPanel.accessDenied);
                    navigate('/');
                    return;
                }
                
                setIsAuthorized(true);
                
            } catch (error) {
                console.error('Token check error:', error);
                alert(t.adminPanel.authError);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        checkModeratorRole();
    }, [navigate, t]);

    if (loading) {
        return (
            <>
                <Header />
                <div className="admin-loading">
                    <div className="spinner"></div>
                    <p>{t.adminPanel.loading}</p>
                </div>
                <Footer />
            </>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <>
            <Header />
            <div className="admin-panel">
                <div className="admin-container">
                    <div className="admin-header">
                        <h1>{t.adminPanel.title}</h1>
                        <p className="admin-subtitle">{t.adminPanel.subtitle}</p>
                    </div>

                    <div className="admin-cards">
                        <div 
                            className="admin-card"
                            onClick={() => navigate('/admin/adverts')}
                        >
                            <div className="card-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2V7h-4v2h2z"/>
                                </svg>
                            </div>
                            <h2>{t.adminPanel.advertsCard.title}</h2>
                            <p>{t.adminPanel.advertsCard.description}</p>
                            <div className="card-arrow">→</div>
                        </div>

                        <div 
                            className="admin-card"
                            onClick={() => navigate('/admin/chats')}
                        >
                            <div className="card-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                                </svg>
                            </div>
                            <h2>{t.adminPanel.chatsCard.title}</h2>
                            <p>{t.adminPanel.chatsCard.description}</p>
                            <div className="card-arrow">→</div>
                        </div>

                        <div 
                            className="admin-card"
                            onClick={() => navigate('/admin/statistics')}
                        >
                            <div className="card-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                                </svg>
                            </div>
                            <h2>{t.adminPanel.statisticsCard.title}</h2>
                            <p>{t.adminPanel.statisticsCard.description}</p>
                            <div className="card-arrow">→</div>
                        </div>
                        <div 
                            className="admin-card"
                            onClick={() => navigate('/admin/users')}
                        >
                            <div className="card-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                            </div>
                            <h2>{t.adminPanel.usersCard.title}</h2>
                            <p>{t.adminPanel.usersCard.description}</p>
                            <div className="card-arrow">→</div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default AdminPanel;