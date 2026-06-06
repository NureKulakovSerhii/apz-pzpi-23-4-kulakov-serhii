import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { adminUserService } from '../services/adminUserService';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/AdminUsers.css';

function AdminUsers() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminUserService.getAllUsers();
            console.log('Loaded users:', data);
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
            alert(t.adminUsers.loadError);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId) => {
        if (!window.confirm(t.adminUsers.confirmBlock)) return;
        
        try {
            setActionLoading(userId);
            const result = await adminUserService.blockUser(userId);
            console.log('Block result:', result);
            alert(t.adminUsers.blockSuccess);
            setTimeout(() => loadUsers(), 500);
        } catch (error) {
            console.error('Error blocking user:', error);
            alert(t.adminUsers.blockError);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnblockUser = async (userId) => {
        if (!window.confirm(t.adminUsers.confirmUnblock)) return;
        
        try {
            setActionLoading(userId);
            const result = await adminUserService.unblockUser(userId);
            console.log('Unblock result:', result);
            alert(t.adminUsers.unblockSuccess);
            setTimeout(() => loadUsers(), 500);
        } catch (error) {
            console.error('Error unblocking user:', error);
            alert(t.adminUsers.unblockError);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = searchTerm === '' || 
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const isBlocked = user.isBlocked === true || user.isBlocked === 1;
        
        if (filter === 'blocked') {
            return matchesSearch && isBlocked;
        }
        if (filter === 'active') {
            return matchesSearch && !isBlocked;
        }
        return matchesSearch;
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <>
            <Header />
            <div className="admin-users-page">
                <div className="admin-users-container">
                    <div className="page-header">
                        <button className="back-btn" onClick={() => navigate('/admin')}>
                            ← {t.adminUsers.back}
                        </button>
                        <h1>{t.adminUsers.title}</h1>
                        <p className="page-subtitle">{t.adminUsers.subtitle}</p>
                    </div>

                    <div className="users-controls">
                        <div className="search-box">
                            <input
                                type="text"
                                className="search-input"
                                placeholder={t.adminUsers.searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="search-icon">🔍</span>
                        </div>
                        
                        <div className="filter-buttons">
                            <button 
                                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                {t.adminUsers.allUsers}
                            </button>
                            <button 
                                className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                                onClick={() => setFilter('active')}
                            >
                                {t.adminUsers.activeUsers}
                            </button>
                            <button 
                                className={`filter-btn ${filter === 'blocked' ? 'active' : ''}`}
                                onClick={() => setFilter('blocked')}
                            >
                                {t.adminUsers.blockedUsers}
                            </button>
                        </div>
                    </div>

                    <div className="users-summary">
                        <span className="summary-item">{t.adminUsers.totalUsers.replace('{count}', users.length)}</span>
                        <span className="summary-item">{t.adminUsers.activeUsersCount.replace('{count}', users.filter(u => u.isBlocked !== true).length)}</span>
                        <span className="summary-item">{t.adminUsers.blockedUsersCount.replace('{count}', users.filter(u => u.isBlocked === true).length)}</span>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>{t.adminUsers.loading}</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="empty-state">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            <h2>{t.adminUsers.noUsers}</h2>
                            <p>{t.adminUsers.noUsersText}</p>
                        </div>
                    ) : (
                        <div className="users-table-wrap">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>{t.adminUsers.user}</th>
                                        <th>{t.adminUsers.contact}</th>
                                        <th>{t.adminUsers.registered}</th>
                                        <th>{t.adminUsers.role}</th>
                                        <th>{t.adminUsers.adverts}</th>
                                        <th>{t.adminUsers.status}</th>
                                        <th>{t.adminUsers.actions}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => {
                                        const isBlocked = user.isBlocked === true || user.isBlocked === 1;
                                        return (
                                            <tr key={user.id} className={isBlocked ? 'user-blocked' : ''}>
                                                <td>
                                                    <div className="user-info-cell">
                                                        <div className="user-avatar">
                                                            {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                                        </div>
                                                        <div className="user-name-cell">
                                                            <strong>{user.name} {user.surname}</strong>
                                                            <span className="user-email-cell">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="user-contact">
                                                        <span>{user.phoneNumber || '—'}</span>
                                                        {user.secondPhoneNumber && <span className="second-phone">{user.secondPhoneNumber}</span>}
                                                    </div>
                                                </td>
                                                <td>{formatDate(user.createdAt)}</td>
                                                <td>
                                                    <div className="user-roles">
                                                        {user.roles?.map(role => (
                                                            <span key={role} className={`role-badge role-${role.toLowerCase()}`}>
                                                                {role === 'Moderator' ? 'Модератор' : 'Користувач'}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="adverts-stats">
                                                        <span className="adverts-total">{user.advertsCount}</span>
                                                        <span className="adverts-active">({user.activeAdvertsCount} {t.adminUsers.active})</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${isBlocked ? 'status-blocked' : 'status-active'}`}>
                                                        {isBlocked ? t.adminUsers.blocked : t.adminUsers.active}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="user-actions">
                                                        {isBlocked ? (
                                                            <button 
                                                                className="btn-unblock"
                                                                onClick={() => handleUnblockUser(user.id)}
                                                                disabled={actionLoading === user.id}
                                                            >
                                                                {actionLoading === user.id ? t.adminUsers.processing : t.adminUsers.unblock}
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                className="btn-block"
                                                                onClick={() => handleBlockUser(user.id)}
                                                                disabled={actionLoading === user.id}
                                                            >
                                                                {actionLoading === user.id ? t.adminUsers.processing : t.adminUsers.block}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
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

export default AdminUsers;