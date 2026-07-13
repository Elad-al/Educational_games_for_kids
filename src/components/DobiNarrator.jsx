import React, { useState, useEffect } from 'react';
import { playSfx, registerSpeakingListener } from '../hooks/useAudio';

export default function DobiNarrator({ bubbleText, onNarratorClick }) {
    const [tapCount, setTapCount] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        registerSpeakingListener((speaking) => {
            setIsSpeaking(speaking);
        });
        return () => {
            registerSpeakingListener(null);
        };
    }, []);

    const handleDobiTap = () => {
        playSfx('pop', 700 + Math.random() * 300);
        setTapCount(prev => prev + 1);

        if (onNarratorClick) {
            onNarratorClick();
        }
    };

    return (
        <div className="narrator-container">
            {bubbleText && (
                <div className="dobi-bubble" key={bubbleText}>
                    {bubbleText}
                </div>
            )}
            
            <div className="dobi-avatar-wrapper" onClick={handleDobiTap}>
                {/* Custom Illustrated Disney-Style SVG Teddy Bear */}
                <svg className="dobi-svg-bear" viewBox="0 0 120 120" width="100%" height="100%">
                    <defs>
                        <linearGradient id="bearBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#be8560" />
                            <stop offset="50%" stopColor="#a76f4e" />
                            <stop offset="100%" stopColor="#8d5635" />
                        </linearGradient>
                        <linearGradient id="bearSnoutGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#fff8e1" />
                            <stop offset="100%" stopColor="#ffecb3" />
                        </linearGradient>
                    </defs>

                    {/* Ears */}
                    <g className="bear-ears">
                        <circle cx="28" cy="28" r="18" fill="url(#bearBodyGrad)" stroke="#5d3b25" strokeWidth="3" />
                        <circle cx="28" cy="28" r="10" fill="#ff8a80" stroke="#c62828" strokeWidth="1.5" />
                        <circle cx="92" cy="28" r="18" fill="url(#bearBodyGrad)" stroke="#5d3b25" strokeWidth="3" />
                        <circle cx="92" cy="28" r="10" fill="#ff8a80" stroke="#c62828" strokeWidth="1.5" />
                    </g>
                    
                    {/* Head Group */}
                    <g className="bear-head-group">
                        <ellipse cx="60" cy="65" rx="42" ry="38" fill="url(#bearBodyGrad)" stroke="#5d3b25" strokeWidth="3.5" />
                        
                        {/* Hair Tuft */}
                        <path d="M 52 28 Q 60 14 64 28 Q 70 17 73 30 Z" fill="url(#bearBodyGrad)" stroke="#5d3b25" strokeWidth="2.5" />
                        
                        {/* Cheeks Blush */}
                        <ellipse cx="32" cy="74" rx="9" ry="5.5" fill="#ff4081" opacity="0.55" />
                        <ellipse cx="88" cy="74" rx="9" ry="5.5" fill="#ff4081" opacity="0.55" />
                        
                        {/* Snout & Mouth */}
                        <ellipse cx="60" cy="76" rx="18" ry="12" fill="url(#bearSnoutGrad)" stroke="#5d3b25" strokeWidth="2.5" />
                        <path d="M 60 70 L 60 77" stroke="#5d3b25" strokeWidth="2.5" strokeLinecap="round" />
                        
                        {/* Talking Mouth Path */}
                        <path 
                            className={`bear-mouth ${isSpeaking ? 'speaking' : ''}`}
                            d="M 54 77 Q 60 82 66 77" 
                            fill="none" 
                            stroke="#5d3b25" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                        />
                        <polygon points="52,69 68,69 60,76" fill="#3e2723" stroke="#5d3b25" strokeWidth="1.5" />
                        
                        {/* Eyes with Shiny Highlights */}
                        <g className="bear-eyes">
                            <circle cx="41" cy="54" r="8" fill="#2d3748" />
                            <circle cx="39" cy="51" r="3.2" fill="#fff" />
                            <circle cx="43" cy="56" r="1.5" fill="#fff" />
                            
                            <circle cx="79" cy="54" r="8" fill="#2d3748" />
                            <circle cx="77" cy="51" r="3.2" fill="#fff" />
                            <circle cx="81" cy="56" r="1.5" fill="#fff" />
                        </g>

                        {/* Cute Eyebrows */}
                        <path d="M 34 43 Q 41 40 46 45" fill="none" stroke="#5d3b25" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M 86 43 Q 79 40 74 45" fill="none" stroke="#5d3b25" strokeWidth="2.5" strokeLinecap="round" />
                    </g>
                </svg>
            </div>
        </div>
    );
}
