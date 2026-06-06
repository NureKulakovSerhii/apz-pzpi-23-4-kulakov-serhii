import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; 
import { loginUser } from '../services/authService';
import { saveAuthData } from '../utils/auth';
import '../styles/Auth.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const fromPage = location.state?.from?.pathname || '/';
    
    const handleSubmit = async (e) => {
        console.log('Відправляю:', {
            email: email.trim(),
            password: password
        });
        e.preventDefault(); 
        setError(''); 
        setLoading(true); 

        try {
            const result = await loginUser(email, password);
            console.log('Отримано:', result);
            saveAuthData(result);
            navigate(fromPage, { replace: true });
            
        } catch (err) {
            setError(err.message || 'Невірний email або пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="auth-page">
                <div className="auth-container">
                    <h1 className="auth-title">Увійти в акаунт</h1>
                    
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                    
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Електронна пошта</label>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Пароль</label>
                            <div className="password-input-wrapper">
                                <input
                                    type="password"
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="auth-links">
                            <span className="auth-link" onClick={() => navigate('/register')}>
                                Немає акаунта?
                            </span>
                        </div>

                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Вхід...' : 'Увійти'}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default LoginPage;