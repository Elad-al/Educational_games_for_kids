import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';

export default function AdventureMap({ type, onSelectLevel, onBack }) {
    console.log("Lottie import:", Lottie);
    console.log("motion import:", motion);
    const isLiteracy = type === 'literacy';

    const levels = isLiteracy ? [
        { id: 1, label: 'הכרת האותיות', emoji: 'א', left: '20%', top: '70%' },
        { id: 2, label: 'חיפוש אותיות', emoji: '🔍', left: '50%', top: '30%' },
        { id: 3, label: 'שרביט קסמים', emoji: '🪄', left: '80%', top: '70%' }
    ] : [
        { id: 1, label: 'צבעים', emoji: '🎨', left: '20%', top: '75%' },
        { id: 2, label: 'מספרים', emoji: '🔢', left: '40%', top: '35%' },
        { id: 3, label: 'צורות', emoji: '📐', left: '60%', top: '75%' },
        { id: 4, label: 'קטגוריות', emoji: '🦁', left: '80%', top: '35%' }
    ];

    const [animatingNodeId, setAnimatingNodeId] = useState(null);

    const handleNodeClick = (lvl) => {
        if (animatingNodeId) return;
        setAnimatingNodeId(lvl.id);
        
        setTimeout(() => {
            onSelectLevel(lvl.id);
            setAnimatingNodeId(null);
        }, 1000);
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div className="header-bar" style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 100, display: 'flex', justifyContent: 'center', padding: '10px' }}>
                <button className="cartoon-button btn-yellow" style={{ position: 'absolute', left: '20px', padding: '8px 20px' }} onClick={onBack}>🏠</button>
                <h1 className="cartoon-text-title" style={{ margin: 0, fontSize: '3.5rem' }}>
                    {isLiteracy ? 'עולם האותיות' : 'הרפתקאות המיון'}
                </h1>
            </div>

            {/* Responsive SVG Path */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path 
                        d={isLiteracy 
                            ? "M 20 70 Q 50 -10 80 70" 
                            : "M 20 75 Q 30 10 40 35 T 60 75 T 80 35"}
                        fill="none" 
                        stroke="rgba(255, 255, 255, 0.4)" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                    />
                    <path 
                        d={isLiteracy 
                            ? "M 20 70 Q 50 -10 80 70" 
                            : "M 20 75 Q 30 10 40 35 T 60 75 T 80 35"}
                        fill="none" 
                        stroke="#fff" 
                        strokeWidth="0.5" 
                        strokeDasharray="2, 2"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {/* Render Nodes */}
            {levels.map((lvl) => {
                const isAnimating = animatingNodeId === lvl.id;
                // Fetch progress from localStorage
                const progressKey = isLiteracy ? 'literacyProgress' : 'sortingProgress';
                const progressData = JSON.parse(localStorage.getItem(progressKey) || '{}');
                const wins = progressData[lvl.id]?.wins || 0;
                const stars = wins >= 3 ? '⭐⭐⭐' : wins === 2 ? '⭐⭐' : wins === 1 ? '⭐' : '';

                return (
                    <motion.div
                        key={lvl.id}
                        style={{
                            position: 'absolute',
                            left: lvl.left,
                            top: lvl.top,
                            transform: 'translate(-50%, -50%)',
                            zIndex: isAnimating ? 300 : 50,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                        onClick={() => handleNodeClick(lvl)}
                        animate={isAnimating ? {
                            scale: [1, 1.4, 1.25],
                            rotate: [0, 10, -10, 0]
                        } : {
                            y: [0, -10, 0] // continuous soft pulse
                        }}
                        transition={isAnimating ? { duration: 1 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="node-content" style={{
                            width: 80, height: 80, borderRadius: '50%', background: '#fff', 
                            border: '4px solid var(--color-primary-blue)',
                            boxShadow: '0 6px 0 #0277BD, 0 10px 15px rgba(0,0,0,0.2)', display: 'flex',
                            justifyContent: 'center', alignItems: 'center', fontSize: 40
                        }}>
                            {lvl.emoji}
                        </div>
                        <div className="map-node-sign" style={{ marginTop: '12px', fontSize: '18px' }}>
                            {lvl.label}
                        </div>
                        {stars && <div style={{ fontSize: 20, marginTop: 4 }}>{stars}</div>}

                        {/* Living Lottie Character standing on the first node if not completed, or active node */}
                        {lvl.id === 1 && !animatingNodeId && (() => {
                            const LottieComponent = Lottie.default || Lottie;
                            return (
                                <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', width: 120, pointerEvents: 'none' }}>
                                    <LottieComponent 
                                        animationData={null} 
                                        path="https://assets8.lottiefiles.com/packages/lf20_touohxv0.json"
                                        loop={true} 
                                    />
                                </div>
                            );
                        })()}
                    </motion.div>
                );
            })}
        </div>
    );
}
