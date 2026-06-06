import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { registerUser } from '../services/authService';
import { saveAuthData } from '../utils/auth';
import '../styles/Auth.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function RegistrationPage() {
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    }); 
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const fromPage = location.state?.from?.pathname || '/';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Введіть коректний email');
            return;
        }
        if (formData.password.length < 6) {
            setError('Пароль має бути мінімум 6 символів');
            return;
        }
        
        setLoading(true);
        
        try {
            const result = await registerUser(formData);
            saveAuthData(result);
            navigate(fromPage, { replace: true });
            
        } catch (err) {
            setError(err.message || 'Помилка реєстрації. Спробуйте ще раз.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="auth-page">
                <div className="auth-container">
                    <h1 className="auth-title">Реєстрація</h1>
                    
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                    
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Ім'я</label>
                            <input
                                type="text"
                                name="firstName"
                                className="form-input"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Введіть ваше ім'я"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Прізвище</label>
                            <input
                                type="text"
                                name="lastName"
                                className="form-input"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Введіть ваше прізвище"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Електронна пошта</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Пароль</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="form-input"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                    minLength="6"
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                >
                                    {showPassword ? '🙈' : '👁️'} 
                                </button>
                            </div>
                        </div>

                        <div className="auth-links">
                            <span className="auth-link" onClick={() => navigate('/login')}>
                                Вже є акаунт?
                            </span>
                        </div>

                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Реєстрація...' : 'Зареєструватися'}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default RegistrationPage;