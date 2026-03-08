import React from 'react';
import './RetroStyles.css';

const CTA: React.FC = () => {
    return (
        <div className="py-20 px-4 bg-black retro-grid">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold retro-gradient mb-6 retro-flicker">
                    Ready to Build Something Lovable?
                </h2>
                <p className="text-xl text-gray-300 mb-8 retro-flicker">
                    Join thousands of developers who are already using Lovable to create stunning applications.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="retro-btn retro-flicker px-8 py-3 text-lg">
                        Start Coding Now
                    </button>
                    <button className="text-white border border-white px-8 py-3 text-lg hover:bg-white hover:text-black transition-all duration-300 retro-flicker">
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CTA;