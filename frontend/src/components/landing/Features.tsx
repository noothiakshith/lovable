import React from 'react';
import './RetroStyles.css';

const features = [
    {
        title: "AI-Powered Coding",
        description: "Let our AI agents write and optimize your code while you focus on building.",
        icon: "✨",
    },
    {
        title: "Real-Time Preview",
        description: "See changes instantly with our live preview feature.",
        icon: "👁️",
    },
    {
        title: "Collaborative Editing",
        description: "Work with your team in real-time and streamline your workflow.",
        icon: "🤝",
    },
    {
        title: "Customizable Templates",
        description: "Start with our pre-built templates and customize them to fit your needs.",
        icon: "🎨",
    },
];

const Features: React.FC = () => {
    return (
        <div className="py-20 px-4 bg-black retro-grid">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold retro-gradient mb-12 retro-flicker">
                    Why Choose Lovable?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="p-6 border border-cyan-400 rounded-lg bg-black retro-flicker"
                        >
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Features;