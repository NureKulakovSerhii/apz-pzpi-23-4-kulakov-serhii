import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import Message from "../components/Message";
import { supportService } from '../services/supportService';
import { jwtDecode } from 'jwt-decode';
import '../styles/SupportChat.css';
import { useTranslation } from '../hooks/useTranslation';

function SupportChatPage() {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const messagesEndRef = useRef(null);
    
    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isModerator, setIsModerator] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const loadData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                
                const decoded = jwtDecode(token);
                let userRoles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
                
                if (typeof userRoles === 'string') {
                    userRoles = [userRoles];
                }
                
                const hasModeratorRole = Array.isArray(userRoles) && userRoles.includes('Moderator');
                setIsModerator(hasModeratorRole);
                
                const userEmail = decoded.email || 
                                 decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
                                 '';
                setCurrentUserEmail(userEmail);
                
                const ticketData = await supportService.getTicketById(ticketId);
                setTicket(ticketData);
                
                await loadComments();
                
                if (!hasModeratorRole && ticketData.userEmail !== userEmail) {
                    alert(t.supportChat.accessDenied);
                    navigate('/support');
                    return;
                }
                
            } catch (error) {
                console.error('Error loading chat:', error);
                alert(t.supportChat.loadError);
                navigate(isModerator ? '/admin/chats' : '/support');
            } finally {
                setLoading(false);
            }
        };

        loadData();
        
        const interval = setInterval(() => {
            if (ticket?.status !== 2) {
                loadComments();
            }
        }, 5000);
        
        return () => clearInterval(interval);
    }, [navigate, ticketId, t]);

    const loadComments = async () => {
        try {
            const commentsData = await supportService.getTicketComments(ticketId);
            setMessages(commentsData);
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim()) return;

        try {
            setSending(true);
            await supportService.sendComment(ticketId, newMessage);
            setNewMessage('');
            
            setTimeout(() => {
                loadComments();
            }, 300);
            
        } catch (error) {
            console.error('Error sending message:', error);
            alert(`${t.supportChat.sendError}: ${error.message}`);
        } finally {
            setSending(false);
        }
    };

    const handleCloseTicket = async () => {
        if (!window.confirm(t.supportChat.confirmClose)) {
            return;
        }

        try {
            await supportService.closeTicket(ticketId);
            alert(t.supportChat.closeSuccess);
            if (isModerator) {
                navigate('/admin/chats');
            } else {
                navigate('/support');
            }
        } catch (error) {
            console.error('Error closing ticket:', error);
            alert(`${t.supportChat.closeError}: ${error.message}`);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return t.supportChat.unknownDate;
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${hours}:${minutes}`;
    };

    const getMessageType = (message) => {
        if (message.userEmail === currentUserEmail) {
            return isModerator ? "support" : "user";
        }
        
        if (isModerator && message.sender === "support") {
            return "support";
        }
        
        return message.sender;
    };

    const getStatusText = (status) => {
        switch(status) {
            case 0: return t.supportChat.statusOpen;
            case 1: return t.supportChat.statusInProgress;
            case 2: return t.supportChat.statusClosed;
            default: return t.supportChat.statusOpen;
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="chat-loading">
                    <div className="spinner"></div>
                    <p>{t.supportChat.loading}</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="support-chat-page">
                <div className="chat-container">
                    <div className="chat-header">
                        <button className="back-btn" onClick={() => navigate(isModerator ? '/admin/chats' : '/support')}>
                            ← {t.supportChat.back}
                        </button>
                        <div className="header-content">
                            <h1>{ticket.title}</h1>
                            <div className="header-info">
                                <span className={`ticket-status status-${ticket.status}`}>
                                    {getStatusText(ticket.status)}
                                </span>
                                <span className="ticket-date">
                                    {t.supportChat.created.replace('{date}', formatDateTime(ticket.createdAt))}
                                </span>
                            </div>
                        </div>
                        
                        {isModerator && ticket.status !== 2 && (
                            <button className="close-ticket-btn" onClick={handleCloseTicket}>
                                {t.supportChat.closeTicket}
                            </button>
                        )}
                    </div>

                    <div className="ticket-info">
                        <div className="user-info">
                            <div className="user-avatar">
                                {ticket.userName?.charAt(0) || 'U'}
                            </div>
                            <div className="user-details">
                                <span className="user-name">{ticket.userName}</span>
                                <span className="user-email">{ticket.userEmail}</span>
                            </div>
                        </div>
                        
                        <div className="ticket-description">
                            <h3>{t.supportChat.problemDescription}</h3>
                            <p>{ticket.description}</p>
                        </div>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <div className="empty-chat">
                                <p>{t.supportChat.emptyChat}</p>
                            </div>
                        ) : (
                            <>
                                {messages.map(message => (
                                    <Message 
                                        key={message.id}
                                        text={message.text}
                                        time={formatTime(message.createdAt)}
                                        sender={getMessageType(message)}
                                        authorName={message.userEmail}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>
                    
                    {ticket.status !== 2 && (
                        <form onSubmit={handleSendMessage} className="chat-input-area">
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    className="chat-input"
                                    placeholder={isModerator ? t.supportChat.moderatorPlaceholder : t.supportChat.userPlaceholder}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    required
                                    disabled={sending}
                                />
                                <div className="input-actions">
                                    <button 
                                        type="submit" 
                                        className="send-btn"
                                        disabled={sending || !newMessage.trim()}
                                    >
                                        {sending ? t.supportChat.sending : t.supportChat.send}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                    {ticket.status !== 2 && (
                        <div className="chat-controls">
                            {!isModerator && (
                                <button className="user-close-btn" onClick={handleCloseTicket}>
                                    {t.supportChat.completeChat}
                                </button>
                            )}
                            {isModerator && (
                                <button className="close-ticket-btn" onClick={handleCloseTicket}>
                                    {t.supportChat.closeTicket}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default SupportChatPage;