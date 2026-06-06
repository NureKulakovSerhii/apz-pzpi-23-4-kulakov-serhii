import '../styles/Footer.css';
import { useTranslation } from '../hooks/useTranslation';

function Footer() {
    const { t } = useTranslation();
    
    const footerColumns = [
        [
            t.footer.mobileApp,
            t.footer.supportFeedback,
            t.footer.paidServices
        ],
        [
            t.footer.rentalRates,
            t.footer.businessClients,
            t.footer.blog
        ],
        [
            t.footer.termsOfUse,
            t.footer.privacyPolicy,
            t.footer.cookiesPolicy
        ],
        [
            t.footer.advertiseOnSite,
            t.footer.affiliateProgram,
            t.footer.press
        ]
    ];

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-links-grid">
                    {footerColumns.map((column, columnIndex) => (
                        <div key={columnIndex} className="footer-column">
                            {column.map((link, linkIndex) => (
                                <a key={linkIndex} href="#" className="footer-link">
                                    {link}
                                </a>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="footer-apps-section">
                    <div className="footer-apps">
                        <a href="#" className="app-store-btn">
                            <img 
                                src="../src/assets/appstore.png" 
                                className="app-store-img"
                                alt="App Store"
                            />
                        </a>
                        <a href="#" className="app-store-btn">
                            <img 
                                src="../src/assets/googleplay.jpg" 
                                className="app-store-img"
                                alt="Google Play"
                            />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;