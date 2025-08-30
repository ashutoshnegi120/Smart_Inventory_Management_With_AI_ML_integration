import { useEffect, useRef, useState } from 'react';
import './css/features.css';
import gsap from 'gsap';
import img1 from '../assets/hero.jpg';
import img2 from '../assets/hero.jpg';
import img3 from '../assets/hero.jpg';

const slides = [
    {
        image: img1,
        title: 'Smart Inventory AI',
        description: 'Track, manage, and automate your inventory operations with our advanced AI system.',
    },
    {
        image: img2,
        title: 'Real-Time Stock Updates',
        description: 'Stay updated with instant stock changes across all channels.',
    },
    {
        image: img3,
        title: 'Multi-Channel Integration',
        description: 'Sync inventory with multiple platforms for seamless management.',
    },
];

const Features = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const contentRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        animateTextIn();
    }, [currentSlide]);

    useEffect(() => {
        startAutoSlide();
        return stopAutoSlide;
    }, []);

    const animateTextIn = () => {
        if (contentRef.current) {
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
            );
        }
    };

    const startAutoSlide = () => {
        intervalRef.current = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
    };

    const stopAutoSlide = () => {
        clearInterval(intervalRef.current);
    };

    const handleNext = () => {
        stopAutoSlide();
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const handlePrev = () => {
        stopAutoSlide();
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <section className="slider-container">
            {slides.map((slide, i) => (
                <div
                    key={i}
                    className={`slider-slide ${i === currentSlide ? 'active' : ''}`}
                    style={{ backgroundImage: `url(${slide.image})` }}
                >
                    <div className="overlay">
                        <div ref={i === currentSlide ? contentRef : null} className="slide-content">
                            <h1>{slide.title}</h1>
                            <p>{slide.description}</p>
                            <div className="nav-buttons">
                                <button onClick={handlePrev}>⟵</button>
                                <button onClick={handleNext}>⟶</button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
};

export default Features;
