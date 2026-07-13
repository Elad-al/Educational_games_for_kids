import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { playSfx, playSparkle } from '../hooks/useAudio';

export default function GameMap({ type, onSelectLevel, onBack }) {
    const levels = type === 'sorting' ? [
        { id: 1, label: 'צבעים', emoji: '🎨', position: { x: 18, y: 50 } },
        { id: 2, label: 'מספרים', emoji: '🔢', position: { x: 38, y: 18 } },
        { id: 3, label: 'צורות', emoji: '📐', position: { x: 60, y: 58 } },
        { id: 4, label: 'קטגוריות', emoji: '🦁', position: { x: 82, y: 25 } }
    ] : [
        { id: 1, label: 'הכרת האותיות', emoji: 'א', position: { x: 18, y: 48 } },
        { id: 2, label: 'חיפוש אותיות', emoji: '🔍', position: { x: 50, y: 18 } },
        { id: 3, label: 'שרביט קסמים', emoji: '🪄', position: { x: 80, y: 48 } }
    ];

    const [animatingNodeId, setAnimatingNodeId] = useState(null);
    const [unicornPos, setUnicornPos] = useState({ x: levels[0].position.x, y: levels[0].position.y });

    // Get progress stars for a level
    const getStars = (levelId) => {
        const progressKey = type === 'sorting' ? 'sortingProgress' : 'literacyProgress';
        try {
            const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
            const data = progress[levelId];
            if (!data) return '';
            if (data.wins >= 3) return '⭐⭐⭐';
            if (data.wins >= 2) return '⭐⭐';
            if (data.wins >= 1) return '⭐';
        } catch (e) {
            console.error(e);
        }
        return '';
    };

    const handleNodeClick = (lvl) => {
        if (animatingNodeId) return; // Prevent double clicks
        
        // 1. Move the unicorn to clicked node
        setUnicornPos({ x: lvl.position.x, y: lvl.position.y });
        playSfx('pop', 700);

        // 2. Wait for unicorn to arrive (800ms)
        setTimeout(() => {
            setAnimatingNodeId(lvl.id);
            playSparkle();

            // 3. Wait for magical selection spin (800ms)
            setTimeout(() => {
                onSelectLevel(lvl.id);
                setAnimatingNodeId(null);
            }, 800);
        }, 800);
    };

    return (
        <div className="view-container">
            <div className="header-bar">
                <button className="btn-round" onClick={onBack}>
                    🏠
                </button>
                <h1 className="header-title">
                    {type === 'sorting' ? 'מפת משחקי מיון' : 'מפת לימוד אותיות'}
                </h1>
                <div style={{ width: 64 }}></div> {/* spacer */}
            </div>

            <div className="map-container">
                <div className="map-path">
                    {/* Fairytale backgrounds details */}
                    <div className="map-detail castle-end">🏰</div>
                    <div className="map-detail tree-1">🌳</div>
                    <div className="map-detail tree-2">🌳</div>
                    <div className="map-detail star-glow-1">✨</div>
                    <div className="map-detail star-glow-2">✨</div>

                    {/* Dotted curve representing the road path */}
                    <svg className="road-path-svg" width="100%" height="100%" viewBox="0 0 900 450" preserveAspectRatio="none">
                        <path 
                            d="M 160 225 Q 340 70 540 260 T 800 225" 
                            fill="none" 
                            stroke="rgba(255,255,255,0.7)" 
                            strokeWidth="14" 
                            strokeDasharray="20, 20" 
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Level nodes */}
                    {levels.map((lvl) => {
                        const stars = getStars(lvl.id);
                        const isAnimating = animatingNodeId === lvl.id;
                        
                        return (
                            <motion.div
                                key={lvl.id}
                                className={`map-node node-${lvl.id}`}
                                style={{
                                    position: 'absolute',
                                    left: `${lvl.position.x}%`,
                                    top: `${lvl.position.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: isAnimating ? 300 : 50
                                }}
                                onClick={() => handleNodeClick(lvl)}
                                animate={isAnimating ? {
                                    scale: [1, 1.4, 1.25],
                                    rotate: [0, 180, 360],
                                    filter: [
                                        'drop-shadow(0px 0px 0px rgba(255,215,0,0))', 
                                        'drop-shadow(0px 0px 30px rgba(255,215,0,0.85))', 
                                        'drop-shadow(0px 0px 10px rgba(255,215,0,0.4))'
                                    ]
                                } : { scale: 1, rotate: 0 }}
                                transition={{ duration: 0.8, ease: 'easeInOut' }}
                            >
                                {/* Independent dynamic bobbing animation wrapper */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ 
                                        duration: 2 + (lvl.id * 0.4), 
                                        repeat: Infinity, 
                                        ease: 'easeInOut' 
                                    }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                                >
                                    <div className="node-stars">{stars}</div>
                                    <div className="node-bubble">
                                        {lvl.emoji}
                                    </div>
                                    <div className="node-label">{lvl.label}</div>
                                </motion.div>
                            </motion.div>
                        );
                    })}

                    {/* Unicorn Avatar riding to selected stage */}
                    <motion.div
                        className="unicorn-avatar"
                        animate={{
                            left: `${unicornPos.x}%`,
                            top: `${unicornPos.y}%`
                        }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute',
                            width: '75px',
                            height: '75px',
                            background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)', // pink-purple gradient
                            border: '4px solid #ab47bc',
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '2.8rem',
                            boxShadow: '0 0 20px rgba(171, 71, 188, 0.8), inset 0 0 10px #fff',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 100,
                            pointerEvents: 'none'
                        }}
                    >
                        🦄
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
