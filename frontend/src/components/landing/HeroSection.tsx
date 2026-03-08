import React from 'react';
import './RetroStyles.css';

const HeroSection: React.FC = () => {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden retro-grid">
            {/* Glowing Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-400 rounded-full filter blur-3xl opacity-20 retro-glow"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-20 retro-glow"></div>

            {/* Main Content */}
            <div className="relative z-10 text-center px-4">
                <h1 className="text-6xl md:text-8xl font-bold retro-flicker retro-gradient mb-4">
                    LOVABLE
                </h1>
                <p className="text-xl md:text-2xl text-white retro-flicker mb-8">
                    Create Stunning Apps with AI-Powered Code Agents
                </p>
                <button className="retro-btn retro-flicker text-lg">
                    Get Started Now
                </button>
            </div>

            {/* Retro Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none retro-grid"></div>
        </div>
    );
};

export default HeroSection;