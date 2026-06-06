import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supportService } from '../services/supportService';
import { jwtDecode } from 'jwt-decode';
import '../styles/SupportPage.css';
import { useTranslation } from '../hooks/useTranslation';

function SupportPage() {
    const navigate = useNavigate();
    const { t, loading: translationLoading } = useTranslation();
    const [isCreatingTicket, setIsCreatingTicket] = useState(false);
    const [loading, setLoading] = useState(true);
    const [checkingTickets, setCheckingTickets] = useState(true);
    const [hasActiveTicket, setHasActiveTicket] = useState(false);
    const [activeTicketId, setActiveTicketId] = useState(null);
    
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        priority: 0
    });

    useEffect(() => {
        checkActiveTickets();
    }, []);

    const getPriorityLabel = (priority) => {
        if (!t?.support) return getDefaultPriorityLabel(priority);
        switch(priority) {
            case 0: return t.support.priorityLow;
            case 1: return t.support.priorityMedium;
            case 2: return t.support.priorityHigh;
            default: return t.support.priorityUnknown;
        }
    };


    const getDefaultPriorityLabel = (priority) => {
        switch(priority) {
            case 0: return 'Низький';
            case 1: return 'Середній';
            case 2: return 'Високий';
            default: return 'Невідомо';
        }
    };

    const checkActiveTickets = async () => {
        try {
            setCheckingTickets(true);
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                navigate('/login');
                return;
            }
            const decoded = jwtDecode(token);
            const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
                          decoded.sub || 
                          decoded.nameid;

            if (!userId) {
                setCheckingTickets(false);
                return;
            }
            const openTickets = await supportService.getOpenTickets();
        
            const userActiveTickets = openTickets.filter(ticket => 
                ticket.userId === userId && 
                (ticket.status === 0 || ticket.status === 1)
            );

            if (userActiveTickets.length > 0) {
                const latestTicket = userActiveTickets.reduce((latest, current) => {
                    return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
                });

                setHasActiveTicket(true);
                setActiveTicketId(latestTicket.id);
                
                navigate(`/support/chat/${latestTicket.id}`);
            }
            
        } catch (error) {
            console.error('Error checking active tickets:', error);
        } finally {
            setCheckingTickets(false);
            setLoading(false);
        }
    };

    const handleStartChat = () => {
        setIsCreatingTicket(true);
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        
        if (!newTicket.title.trim() || !newTicket.description.trim()) {
            alert(t?.support?.fillRequired || 'Будь ласка, заповніть заголовок та опис');
            return;
        }

        try {
            setLoading(true);
            
            const createdTicket = await supportService.createTicket(newTicket);
            
            setNewTicket({
                title: '',
                description: '',
                priority: 0
            });
            
            navigate(`/support/chat/${createdTicket.id}`);
            
        } catch (error) {
            console.error('Error creating ticket:', error);
            const errorMsg = t?.support?.createError || 'Не вдалося створити чат';
            alert(`${errorMsg}: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelCreate = () => {
        setIsCreatingTicket(false);
        setNewTicket({
            title: '',
            description: '',
            priority: 0
        });
    };

    const handleGoToActiveChat = () => {
        if (activeTicketId) {
            navigate(`/support/chat/${activeTicketId}`);
        }
    };

    if (translationLoading) {
        return (
            <>
                <Header />
                <div className="support-page">
                    <div className="support-container">
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading...</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (checkingTickets) {
        return (
            <>
                <Header />
                <div className="support-page">
                    <div className="support-container">
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>{t?.support?.checkingTickets || 'Перевірка активних чатів...'}</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (hasActiveTicket && !isCreatingTicket) {
        return (
            <>
                <Header />
                <div className="support-page">
                    <div className="support-container">
                        <div className="active-ticket-info">
                            <div className="active-ticket-header">
                                <h1 className="active-ticket-title">{t?.support?.activeTicketTitle || 'У вас є активний чат з підтримкою'}</h1>
                                <p className="active-ticket-subtitle">
                                    {t?.support?.activeTicketSubtitle || 'Ви можете продовжити обговорення або створити новий чат'}
                                </p>
                            </div>
                            
                            <div className="active-ticket-actions">
                                <button 
                                    className="btn-continue-chat"
                                    onClick={handleGoToActiveChat}
                                >
                                    {t?.support?.continueChat || 'Продовжити чат'}
                                </button>
                                
                                <button 
                                    className="btn-new-chat"
                                    onClick={handleStartChat}
                                    disabled={loading}
                                >
                                    {t?.support?.newChat || 'Створити новий чат'}
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
            <div className="support-page">
                <div className="support-container">
                    {!isCreatingTicket ? (
                        /* Початковий екран - створення чату */
                        <div className="support-start">
                            <h1 className="support-start-title">{t?.support?.startTitle || "Зв'язатися з службою підтримки"}</h1>
                            <p className="support-description">
                                {t?.support?.startDescription || 'Створіть чат з нашою службою підтримки для отримання допомоги'}
                            </p>
                            
                            <button 
                                className="start-chat-btn"
                                onClick={handleStartChat}
                                disabled={loading}
                            >
                                {loading 
                                    ? (t?.support?.creating || 'Створення...') 
                                    : (t?.support?.createChat || 'Створити чат')}
                            </button>
                        </div>
                    ) : (
                        /* Форма створення тікета */
                        <div className="create-ticket-form">
                            <div className="form-header">
                                <button 
                                    className="back-btn"
                                    onClick={handleCancelCreate}
                                >
                                    {t?.support?.back || 'Назад'}
                                </button>
                                <h2 className="form-title">{t?.support?.createChatTitle || 'Створення чату з підтримкою'}</h2>
                            </div>
                            
                            <form onSubmit={handleCreateTicket} className="ticket-form">
                                <div className="form-group">
                                    <label className="form-label">{t?.support?.titleLabel || 'Заголовок *'}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder={t?.support?.titlePlaceholder || 'Короткий опис проблеми'}
                                        value={newTicket.title}
                                        onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">{t?.support?.descriptionLabel || 'Детальний опис *'}</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder={t?.support?.descriptionPlaceholder || 'Детально опишіть вашу проблему або питання...'}
                                        value={newTicket.description}
                                        onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                                        required
                                        disabled={loading}
                                        rows={6}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">{t?.support?.priorityLabel || 'Пріоритет проблеми'}</label>
                                    <div className="priority-options">
                                        {[0, 1, 2].map(priority => (
                                            <label key={priority} className="priority-option">
                                                <input
                                                    type="radio"
                                                    name="priority"
                                                    value={priority}
                                                    checked={newTicket.priority === priority}
                                                    onChange={(e) => setNewTicket({...newTicket, priority: parseInt(e.target.value)})}
                                                    disabled={loading}
                                                />
                                                <span className={`priority-badge priority-${priority}`}>
                                                    {getPriorityLabel(priority)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={handleCancelCreate}
                                        disabled={loading}
                                    >
                                        {t?.support?.cancel || 'Скасувати'}
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="submit-btn"
                                        disabled={loading}
                                    >
                                        {loading 
                                            ? (t?.support?.creating || 'Створення...') 
                                            : (t?.support?.submit || 'Створити чат')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default SupportPage;