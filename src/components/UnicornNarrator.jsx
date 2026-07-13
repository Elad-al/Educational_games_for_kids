import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSfx, registerSpeakingListener } from '../hooks/useAudio';

import unicornBase from '../assets/unicorn_base.png';
import unicornBlink from '../assets/unicorn_blink.png';
import unicornHalfOpen from '../assets/unicorn_half_open.png';
import unicornSpeaking from '../assets/unicorn_speaking.png';

export default function UnicornNarrator({ bubbleText, onNarratorClick }) {
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

    const handleTap = () => {
        playSfx('pop', 700 + Math.random() * 300);
        setTapCount(prev => prev + 1);

        if (onNarratorClick) {
            onNarratorClick();
        }
    };

    return (
        <div className="narrator-container" style={{ position: 'absolute', bottom: '10px', left: '20px', display: 'flex', alignItems: 'flex-end', zIndex: 150 }}>
            {/* The Floating Image Avatar - Seamlessly Integrated */}
            <style>{`
                .breathe-anim {
                    animation: breathe 4s ease-in-out infinite;
                }
                @keyframes breathe {
                    0%, 100% { transform: scale(1) translateY(0); }
                    50% { transform: scale(1.02) translateY(-4px); }
                }
                
                /* Advanced Lip Sync & Blinking */
                .frame-base { opacity: 1; z-index: 1; }
                .frame-half { opacity: 0; z-index: 2; }
                .frame-wide { opacity: 0; z-index: 3; }
                .frame-blink { opacity: 0; z-index: 4; }
                
                .frame-blink {
                    animation: blinkAnim 4s infinite;
                }
                
                .is-speaking .frame-half {
                    animation: talkHalf 0.4s infinite;
                }
                .is-speaking .frame-wide {
                    animation: talkWide 0.4s infinite;
                }
                
                @keyframes blinkAnim {
                    0%, 92%, 100% { opacity: 0; }
                    94%, 98% { opacity: 1; }
                }
                @keyframes talkHalf {
                    0%, 15%, 85%, 100% { opacity: 0; }
                    20%, 80% { opacity: 1; }
                }
                @keyframes talkWide {
                    0%, 35%, 65%, 100% { opacity: 0; }
                    45%, 55% { opacity: 1; }
                }
                
                .anim-img {
                    width: 100%;
                    height: 100%;
                    objectFit: contain;
                    filter: drop-shadow(0 15px 20px rgba(0,0,0,0.4));
                    position: absolute;
                    top: 0;
                    left: 0;
                }
            `}</style>
            
            <div className={`unicorn-avatar-wrapper breathe-anim ${isSpeaking ? 'is-speaking' : ''}`} onClick={handleTap} style={{ cursor: 'pointer', width: '220px', height: '220px', position: 'relative' }}>
                <img className="anim-img frame-base" src={unicornBase} alt="Base" />
                <img className="anim-img frame-half" src={unicornHalfOpen} alt="Half Open" />
                <img className="anim-img frame-wide" src={unicornSpeaking} alt="Wide Open" />
                <img className="anim-img frame-blink" src={unicornBlink} alt="Blink" />
            </div>

            {/* Speech Bubble */}
            <AnimatePresence>
                {bubbleText && (
                    <motion.div 
                        className="unicorn-bubble"
                        initial={{ scale: 0, opacity: 0, x: 20 }}
                        animate={{ scale: 1, opacity: 1, x: 0 }}
                        exit={{ scale: 0, opacity: 0, x: 20 }}
                        style={{ marginLeft: '10px', marginBottom: '80px' }}
                    >
                        {bubbleText}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
