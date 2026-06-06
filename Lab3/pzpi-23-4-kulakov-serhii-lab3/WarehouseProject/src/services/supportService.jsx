const API_URL = 'https://localhost:7234/api';
import { jwtDecode } from "jwt-decode";

export const supportService = {
    async createTicket(ticketData) {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Користувач не авторизований');
            }

            console.log('Відправляємо дані:', JSON.stringify(ticketData));

            const response = await fetch(`${API_URL}/Support/create-ticket`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ticketData)
            });

            console.log('Статус відповіді:', response.status);
            
            if (!response.ok) {
                let errorText = '';
                try {
                    errorText = await response.text();
                    console.error('Помилка сервера:', errorText);
                    
                    if (errorText) {
                        const errorJson = JSON.parse(errorText);
                        if (errorJson.errors) {
                            const errorMessages = Object.values(errorJson.errors).flat().join(', ');
                            throw new Error(errorMessages || errorJson.title || errorText);
                        }
                        throw new Error(errorJson.title || errorJson.message || errorText);
                    } else {
                        throw new Error(`Помилка ${response.status}: ${response.statusText}`);
                    }
                } catch (parseError) {
                    throw new Error(errorText || `Помилка ${response.status}`);
                }
            }

            const result = await response.json();
            console.log('Успішна відповідь:', result);
            return result;
            
        } catch (error) {
            console.error('Помилка створення тікета:', error);
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Не вдалося з\'єднатися з сервером. Перевірте: 1) Чи запущений бекенд 2) Порт 7234 3) https:// замість http://');
            }
            throw error;
        }
    },

    async getOpenTickets() {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Користувач не авторизований');
            }

            const response = await fetch(`${API_URL}/Support/get-opened-tickets`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Не вдалося отримати тікети');
            }

            return await response.json();
        } catch (error) {
            console.error('Помилка отримання тікетів:', error);
            throw error;
        }
    },
    async getTicketById(ticketId) {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Користувач не авторизований');
            }

            const response = await fetch(`${API_URL}/Support/get-ticket-by-id/${ticketId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Не вдалося отримати тікет');
            }

            return await response.json();
        } catch (error) {
            console.error('Помилка отримання тікета:', error);
            throw error;
        }
    },
    async assignTicketToMe(ticketId) {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Користувач не авторизований');
            }

            const response = await fetch(`${API_URL}/Support/${ticketId}/assign`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Не вдалося призначити тікет');
            }

            return await response.json();
        } catch (error) {
            console.error('Помилка призначення тікета:', error);
            throw error;
        }
    },
    async closeTicket(ticketId) {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Користувач не авторизований');
            }

            console.log('Закриваємо тікет:', ticketId);

            const response = await fetch(`${API_URL}/Support/${ticketId}/close`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            console.log('Статус відповіді закриття:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Помилка закриття тікета:', errorText);
                
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.message || errorJson.title || errorText);
                } catch {
                    throw new Error(errorText || `Не вдалося закрити тікет (${response.status})`);
                }
            }

            if (response.status === 204) {
                return { success: true, message: 'Тікет успішно закрито' };
            }

            return await response.json();
            
        } catch (error) {
            console.error('Помилка закриття тікета:', error);
            throw error;
        }
    },
    async createComment(ticketId, text) {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Користувач не авторизований');
            }

            const requestData = {
                text: text,
                ticketId: ticketId
            };

            console.log('Відправляємо коментар:', requestData);

            const response = await fetch(`${API_URL}/Support/create-comment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            console.log('Статус відповіді:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Помилка відповіді:', errorText);
                
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.message || errorJson.title || errorText);
                } catch {
                    throw new Error(errorText || `Помилка відправки повідомлення (${response.status})`);
                }
            }

            const result = await response.json();
            console.log('Успішна відповідь:', result);
            return result;
            
        } catch (error) {
            console.error('Помилка відправки коментаря:', error);
            throw error;
        }
    },

    async getTicketComments(ticketId) {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Користувач не авторизований');
            }

            const response = await fetch(`${API_URL}/Support/get-comments?ticketId=${ticketId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Помилка отримання коментарів:', errorText);
                
                if (response.status === 404) {
                    return [];
                }
                
                throw new Error(errorText || 'Не вдалося отримати коментарі');
            }

            const comments = await response.json();
            
            return comments.map(comment => ({
                id: comment.id,
                text: comment.text,
                createdAt: comment.createdAt,
                sender: this.isFromSupport(comment) ? "support" : "user",
                authorName: comment.userEmail || 'Користувач'
            }));
            
        } catch (error) {
            console.error('Помилка отримання коментарів:', error);
            return [];
        }
    },
    async getCommentById(commentId) {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Користувач не авторизований');
            }

            const response = await fetch(`${API_URL}/Support/${commentId}/get-comment-by-id`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Не вдалося отримати коментар');
            }

            return await response.json();
        } catch (error) {
            console.error('Помилка отримання коментаря:', error);
            throw error;
        }
    },

    async sendComment(ticketId, text) {
        return await this.createComment(ticketId, text);
    },

    async sendMessage(ticketId, message) {
        return await this.createComment(ticketId, message);
    },

    async sendSupportMessage(ticketId, message) {
        return await this.createComment(ticketId, message);
    },

    getCurrentUserId() {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return null;
            
            const decoded = jwtDecode(token);
            return decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
                   decoded.sub || 
                   decoded.nameid;
        } catch (error) {
            console.error('Помилка отримання ID користувача:', error);
            return null;
        }
    },

    isFromSupport(comment) {
        const supportEmails = ['admin', 'support', 'moderator'];
        const userEmail = comment.userEmail?.toLowerCase() || '';
        return supportEmails.some(email => userEmail.includes(email));
    },
};

export const testApiConnection = async () => {
    try {
        console.log('Тестуємо з\'єднання з', API_URL);
        const response = await fetch(`${API_URL}/Support/get-opened-tickets`, {
            method: 'GET',
        });
        console.log('Статус тесту:', response.status);
        return response.ok;
    } catch (error) {
        console.error('Помилка тесту API:', error);
        return false;
    }
};