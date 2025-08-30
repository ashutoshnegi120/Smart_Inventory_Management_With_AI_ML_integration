import "./css/hero.css";
import heroImage from "../assets/hero.jpg";


const Hero = () => {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <div className="hero-left">
                    <h1>Inventory System with AI</h1>
                    <p>
                        Easily manage your stock, product listings, and orders with our powerful AI-driven inventory software. Trusted globally by businesses for speed, control, and insights.
                    </p>
                    <div className="hero-buttons">
                        <button className="primary-btn">Get Started</button>
                        <button className="gradient-border-btn">Speak to Sales</button>
                    </div>
                    <div className="hero-subtext">
                        <span>✓ Universal Access</span>
                        <span>✓ No Personal Guarantee</span>
                        <span>✓ No Hidden Fees</span>
                    </div>
                </div>
                <div className="hero-right">
                    <img src={heroImage} alt="Dashboard Preview" />
                </div>
            </div>
        </section>
    );
};

export default Hero;
