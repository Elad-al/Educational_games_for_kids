import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSfx } from '../hooks/useAudio';

const BALLOON_COLORS = ['#ff5c5c', '#4ca3ff', '#5cd65c', '#ffa34c', '#c75cff', '#ffd633', '#ff66b2'];

export default function BalloonOverlay({ onContinue }) {
    const [balloons, setBalloons] = useState([]);

    // Periodically spawn balloons
    useEffect(() => {
        const interval = setInterval(() => {
            const newBalloon = {
                id: Date.now() + Math.random(),
                x: Math.random() * 85 + 5, // 5% to 90%
                color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
                size: Math.random() * 30 + 70, // 70px to 100px
                speed: Math.random() * 3 + 4, // 4s to 7s to float up
            };
            setBalloons(prev => [...prev, newBalloon]);
        }, 600);

        return () => clearInterval(interval);
    }, []);

    const handlePop = (id) => {
        playSfx('pop', 500 + Math.random() * 400);
        setBalloons(prev => prev.filter(b => b.id !== id));
    };

    return (
        <div className="overlay-full" style={{ zIndex: 500, overflow: 'hidden' }}>
            {/* Balloon floating zone */}
            <div className="balloon-layer">
                <AnimatePresence>
                    {balloons.map(b => (
                        <motion.div
                            key={b.id}
                            className="balloon-clickable"
                            style={{
                                left: `${b.x}%`,
                                backgroundColor: b.color,
                                color: b.color,
                                width: b.size,
                                height: b.size * 1.2,
                                bottom: -150,
                            }}
                            initial={{ y: 0, scale: 1 }}
                            animate={{ y: '-120vh' }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ y: { duration: b.speed, ease: 'linear' } }}
                            onPointerDown={() => handlePop(b.id)}
                            onAnimationComplete={() => {
                                // Remove when floated out of screen
                                setBalloons(prev => prev.filter(item => item.id !== b.id));
                            }}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Victory card */}
            <div className="win-card" style={{ zIndex: 600 }}>
                <div className="win-stars">⭐⭐⭐</div>
                <h1 className="win-title">כל הכבוד! הצלחת!</h1>
                <p style={{ fontSize: '1.4rem', fontWeight: 600 }}>פיצצת את כל הבלונים?</p>
                <button className="btn-primary" onClick={onContinue}>
                    המשך 🌟
                </button>
            </div>
        </div>
    );
}
