import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import AdvertCard from "../components/AdvertCard";
import CurrentTime from "../components/CurrentTime";
import { getAllAdverts } from '../services/advertService';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/Home.css';

function Home() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [adverts, setAdverts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadAdverts = async () => {
            try {
                setLoading(true);
                const data = await getAllAdverts();
                const transformedAdverts = data.map(advert => ({
                    id: advert.id,
                    title: advert.title,
                    description: advert.description,
                    address: advert.warehouse?.address || 'Адреса не вказана',
                    scale: advert.warehouse?.scale || 0,
                    price: advert.warehouse?.pricePerMonth || 0,
                    floor: advert.warehouse?.floor || 0,
                    buildingType: advert.warehouse?.buildingType || 'Невідомий тип',
                    city: advert.warehouse?.city || 'Невідоме місто',
                    url: advert.warehouse?.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
                    createdAt: advert.createdAt,
                    isActive: advert.isActive,
                    author: advert.author
                }));
                
                setAdverts(transformedAdverts);
            } catch (err) {
                console.error('Error loading adverts:', err);
                setError(t.home.loadError);
            } finally {
                setLoading(false);
            }
        };
        loadAdverts();
    }, [t.home.loadError]);

    if (loading) {
        return (
            <>
                <Header />
                <div className="home">
                    <div className="loading-message">
                        <div className="loading-spinner"></div>
                        <p>{t.home.loading}</p>
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
                <div className="home">
                    <div className="error-message">
                        <p>{error}</p>
                        <button className="retry-btn" onClick={() => window.location.reload()}>
                            {t.profile.retry}
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="home">
                <CurrentTime />
                <div className="adverts-grid">
                    {adverts.map((advert) => (
                        <AdvertCard key={advert.id} advert={advert} />
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Home;