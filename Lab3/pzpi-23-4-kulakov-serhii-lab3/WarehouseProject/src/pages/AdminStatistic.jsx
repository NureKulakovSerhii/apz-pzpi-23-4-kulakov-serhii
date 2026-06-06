import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { statisticsService } from '../services/statisticsService';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/AdminStatistics.css';

function AdminStatistics() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            setLoading(true);
            const data = await statisticsService.getStatistics();
            setStatistics(data);
            setError(null);
        } catch (err) {
            console.error('Error loading statistics:', err);
            setError(err.message || 'Не вдалося завантажити статистику');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="admin-statistics-page">
                    <div className="admin-statistics-container">
                        <div className="page-header">
                            <button className="back-btn" onClick={() => navigate('/admin')}>
                                ← {t.adminStatistics.back}
                            </button>
                            <h1>{t.adminStatistics.title}</h1>
                            <p className="page-subtitle">{t.adminStatistics.subtitle}</p>
                        </div>
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>{t.adminStatistics.loading}</p>
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
                <div className="admin-statistics-page">
                    <div className="admin-statistics-container">
                        <div className="page-header">
                            <button className="back-btn" onClick={() => navigate('/admin')}>
                                ← {t.adminStatistics.back}
                            </button>
                            <h1>{t.adminStatistics.title}</h1>
                            <p className="page-subtitle">{t.adminStatistics.subtitle}</p>
                        </div>
                        <div className="error-state">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            <h2>{t.adminStatistics.errorTitle}</h2>
                            <p>{error}</p>
                            <button className="retry-btn" onClick={loadStatistics}>
                                {t.adminStatistics.retry}
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
            <div className="admin-statistics-page">
                <div className="admin-statistics-container">
                    <div className="page-header">
                        <button className="back-btn" onClick={() => navigate('/admin')}>
                            ← {t.adminStatistics.back}
                        </button>
                        <h1>{t.adminStatistics.title}</h1>
                        <p className="page-subtitle">{t.adminStatistics.subtitle}</p>
                    </div>

                    <div className="stats-grid">
                        <div className="stats-card users-card">
                            <div className="card-header">
                                <div className="card-icon"></div>
                                <h3>{t.adminStatistics.users}</h3>
                            </div>
                            <div className="card-stats">
                                <div className="stat-item">
                                    <span className="stat-value">{statistics.totalUsers}</span>
                                    <span className="stat-label">{t.adminStatistics.totalUsers}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{statistics.activeUsers}</span>
                                    <span className="stat-label">{t.adminStatistics.activeUsers}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{statistics.blockedUsers}</span>
                                    <span className="stat-label">{t.adminStatistics.blockedUsers}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{statistics.moderators}</span>
                                    <span className="stat-label">{t.adminStatistics.moderators}</span>
                                </div>
                            </div>
                        </div>
                        <div className="stats-card adverts-card">
                            <div className="card-header">
                                <div className="card-icon"></div>
                                <h3>{t.adminStatistics.adverts}</h3>
                            </div>
                            <div className="card-stats">
                                <div className="stat-item">
                                    <span className="stat-value">{statistics.totalAdverts}</span>
                                    <span className="stat-label">{t.adminStatistics.totalAdverts}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{statistics.activeAdverts}</span>
                                    <span className="stat-label">{t.adminStatistics.activeAdverts}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{statistics.inactiveAdverts}</span>
                                    <span className="stat-label">{t.adminStatistics.inactiveAdverts}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{statistics.totalWarehouses}</span>
                                    <span className="stat-label">{t.adminStatistics.warehouses}</span>
                                </div>
                            </div>
                        </div>
                        <div className="stats-card tickets-card">
                            <div className="card-header">
                                <div className="card-icon"></div>
                                <h3>{t.adminStatistics.tickets}</h3>
                            </div>
                            <div className="card-stats">
                                <div className="stat-item">
                                    <span className="stat-value">{statistics.totalTickets}</span>
                                    <span className="stat-label">{t.adminStatistics.totalTickets}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{statistics.openTickets}</span>
                                    <span className="stat-label">{t.adminStatistics.openTickets}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{statistics.closedTickets}</span>
                                    <span className="stat-label">{t.adminStatistics.closedTickets}</span>
                                </div>
                            </div>
                        </div>
                        <div className="stats-card extra-card">
                            <div className="card-header">
                                <div className="card-icon"></div>
                                <h3>{t.adminStatistics.additional}</h3>
                            </div>
                            <div className="card-stats">
                                <div className="stat-item">
                                    <span className="stat-value">{statistics.totalFavorites}</span>
                                    <span className="stat-label">{t.adminStatistics.totalFavorites}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{statistics.usersWithAdverts}</span>
                                    <span className="stat-label">{t.adminStatistics.usersWithAdverts}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{statistics.averageAdvertsPerUser}</span>
                                    <span className="stat-label">{t.adminStatistics.avgAdvertsPerUser}</span>
                                </div>
                            </div>
                        </div>
                        <div className="stats-card recent-card">
                            <div className="card-header">
                                <div className="card-icon"></div>
                                <h3>{t.adminStatistics.last30Days}</h3>
                            </div>
                            <div className="card-stats">
                                <div className="stat-item">
                                    <span className="stat-value">{statistics.newUsersLast30Days}</span>
                                    <span className="stat-label">{t.adminStatistics.newUsers}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{statistics.newAdvertsLast30Days}</span>
                                    <span className="stat-label">{t.adminStatistics.newAdverts}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="stats-footer">
                        <p className="stats-date">
                            {t.adminStatistics.generatedAt}: {formatDate(statistics.generatedAt)}
                        </p>
                        <div className="export-buttons">
                            <button className="export-btn" onClick={async () => {
                                try {
                                    await statisticsService.exportStatistics();
                                    alert('Статистику експортовано!');
                                } catch (err) {
                                    alert('Помилка експорту');
                                }
                            }}>
                                📊 {t.adminStatistics.exportStats}
                            </button>
                            <button className="export-btn" onClick={async () => {
                                try {
                                    await statisticsService.exportUsers();
                                    alert('Користувачів експортовано!');
                                } catch (err) {
                                    alert('Помилка експорту');
                                }
                            }}>
                                👥 {t.adminStatistics.exportUsers}
                            </button>
                            <button className="export-btn" onClick={async () => {
                                try {
                                    await statisticsService.exportAdverts();
                                    alert('Оголошення експортовано!');
                                } catch (err) {
                                    alert('Помилка експорту');
                                }
                            }}>
                                📦 {t.adminStatistics.exportAdverts}
                            </button>
                        </div>
                        <button className="refresh-btn" onClick={loadStatistics}>
                            🔄 {t.adminStatistics.refresh}
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default AdminStatistics;