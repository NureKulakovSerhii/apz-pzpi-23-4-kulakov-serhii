import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import '../styles/AdminChats.css';
import { supportService } from '../services/supportService';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from '../hooks/useTranslation';

function AdminChats() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);

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
                alert(t.adminChats.accessDenied);
                navigate('/admin');
                return;
            }

            const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
                          decoded.sub || 
                          decoded.nameid;
            setCurrentUserId(userId);

        } catch (error) {
            console.error('Error checking role:', error);
            navigate('/login');
            return;
        }

        loadOpenTickets();
    }, [navigate, t]);

    const loadOpenTickets = async () => {
        try {
            setLoading(true);
            const openTickets = await supportService.getOpenTickets();
            setTickets(openTickets);
        } catch (error) {
            console.error('Error loading tickets:', error);
            alert(t.adminChats.loadError);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (ticket) => {
        try {
            await supportService.assignTicketToMe(ticket.id);
            navigate(`/support/chat/${ticket.id}`);
        } catch (error) {
            console.error('Error assigning ticket:', error);
            alert(`${t.adminChats.assignError}: ${error.message}`);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };

    const getPriorityLabel = (priority) => {
        switch(priority) {
            case 0: return t.adminChats.priorityLow;
            case 1: return t.adminChats.priorityMedium;
            case 2: return t.adminChats.priorityHigh;
            default: return t.adminChats.priorityUnknown;
        }
    };

    const getPriorityClass = (priority) => {
        switch(priority) {
            case 0: return 'priority-low';
            case 1: return 'priority-medium';
            case 2: return 'priority-high';
            default: return 'priority-unknown';
        }
    };

    const isAssignedToMe = (ticket) => {
        return ticket.assignedToId === currentUserId;
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = searchTerm === '' || 
            ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.userName.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === 'unassigned') {
            return matchesSearch && !ticket.assignedToId;
        }
        
        if (filter === 'my-tickets') {
            return matchesSearch && isAssignedToMe(ticket);
        }
        
        if (filter === 'high-priority') {
            return matchesSearch && ticket.priority === 2;
        }
        
        return matchesSearch;
    });

    return (
        <>
            <Header />
            <div className="admin-chats-page">
                <div className="admin-chats-container">
                    <div className="page-header">
                        <button className="back-btn" onClick={() => navigate('/admin')}>
                            ← {t.adminChats.back}
                        </button>
                        <h1>{t.adminChats.title}</h1>
                        <p className="page-subtitle">{t.adminChats.subtitle}</p>
                    </div>

                    <div className="tickets-controls">
                        <div className="search-box">
                            <input
                                type="text"
                                className="search-input"
                                placeholder={t.adminChats.searchPlaceholder}
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
                                {t.adminChats.allTickets}
                            </button>
                            <button 
                                className={`filter-btn ${filter === 'unassigned' ? 'active' : ''}`}
                                onClick={() => setFilter('unassigned')}
                            >
                                {t.adminChats.unassigned}
                            </button>
                            <button 
                                className={`filter-btn ${filter === 'my-tickets' ? 'active' : ''}`}
                                onClick={() => setFilter('my-tickets')}
                            >
                                {t.adminChats.myTickets}
                            </button>
                            <button 
                                className={`filter-btn ${filter === 'high-priority' ? 'active' : ''}`}
                                onClick={() => setFilter('high-priority')}
                            >
                                {t.adminChats.highPriority}
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>{t.adminChats.loading}</p>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="empty-state">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                            </svg>
                            <h2>{t.adminChats.noTickets}</h2>
                            <p>{t.adminChats.noTicketsSubtitle}</p>
                        </div>
                    ) : (
                        <>
                            <div className="tickets-summary">
                                <span className="summary-item">
                                    {t.adminChats.total.replace('{count}', tickets.length)}
                                </span>
                                <span className="summary-item">
                                    {t.adminChats.filtered.replace('{count}', filteredTickets.length)}
                                </span>
                                <span className="summary-item">
                                    {t.adminChats.myTicketsCount.replace('{count}', tickets.filter(t => isAssignedToMe(t)).length)}
                                </span>
                                <span className="summary-item">
                                    {t.adminChats.highPriorityCount.replace('{count}', tickets.filter(t => t.priority === 2).length)}
                                </span>
                            </div>

                            <div className="tickets-grid">
                                {filteredTickets.map(ticket => (
                                    <div key={ticket.id} className="ticket-card">
                                        <div className="ticket-header">
                                            <div className="ticket-title-wrapper">
                                                <h3 className="ticket-title">{ticket.title}</h3>
                                                <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                                                    {getPriorityLabel(ticket.priority)}
                                                </span>
                                            </div>
                                            <span className="ticket-date">
                                                {formatDate(ticket.createdAt)}
                                            </span>
                                        </div>
                                        
                                        <div className="ticket-description">
                                            {ticket.description.length > 120 
                                                ? ticket.description.substring(0, 120) + '...' 
                                                : ticket.description}
                                        </div>
                                        
                                        <div className="ticket-user-info">
                                            <div className="user-avatar">
                                                {ticket.userName?.charAt(0) || 'U'}
                                            </div>
                                            <div className="user-details">
                                                <span className="user-name">{ticket.userName}</span>
                                                <span className="user-email">{ticket.userEmail}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="ticket-assignment">
                                            {ticket.assignedToId ? (
                                                <div className="assigned-to">
                                                    <span className="assigned-label">
                                                        {isAssignedToMe(ticket) 
                                                            ? t.adminChats.assignedToYou 
                                                            : t.adminChats.assignedToOther}
                                                    </span>
                                                    <span className="assigned-name">{ticket.assignedToName}</span>
                                                </div>
                                            ) : (
                                                <div className="unassigned">
                                                    <span className="unassigned-label">{t.adminChats.unassignedStatus}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="ticket-actions">
                                            <button 
                                                className="btn-respond"
                                                onClick={() => handleRespond(ticket)}
                                                disabled={ticket.assignedToId && !isAssignedToMe(ticket)}
                                            >
                                                {ticket.assignedToId 
                                                    ? (isAssignedToMe(ticket) ? t.adminChats.goToChat : t.adminChats.alreadyAssigned) 
                                                    : t.adminChats.respond}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default AdminChats;