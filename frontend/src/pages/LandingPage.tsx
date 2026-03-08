import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import Features from '../components/landing/Features';
import CTA from '../components/landing/CTA';
import './../components/landing/RetroStyles.css';

const LandingPage: React.FC = () => {
    return (
        <div className="bg-black text-white font-sans">
            <HeroSection />
            <Features />
            <CTA />
        </div>
    );
};

export default LandingPage;