import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { playSfx, playSparkle } from '../hooks/useAudio';

export default function GameMap({ type, onSelectLevel, onBack }) {
    const [animatingNodeId, setAnimatingNodeId] = useState(null);

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

    // User requested to keep all stages open (unlocked)
    const isLocked = (levelIndex) => {
        return false; // Always unlocked
    };

    const levels = type === 'sorting' ? [
        { id: 1, label: 'צבעים', emoji: '🎨', position: { left: '15%', top: '50%' } },
        { id: 2, label: 'מספרים וצבעים', emoji: '🔢', position: { left: '38%', top: '18%' } },
        { id: 3, label: 'צורות', emoji: '📐', position: { left: '60%', top: '58%' } },
        { id: 4, label: 'קטגוריות', emoji: '🦁', position: { left: '82%', top: '25%' } }
    ] : [
        { id: 1, label: 'הכרת האותיות', emoji: 'א', position: { left: '18%', top: '48%' } },
        { id: 2, label: 'חיפוש אותיות', emoji: '🔍', position: { left: '50%', top: '18%' } },
        { id: 3, label: 'שרביט קסמים', emoji: '🪄', position: { left: '80%', top: '48%' } }
    ];

    const handleNodeClick = (lvl) => {
        if (animatingNodeId) return; // Prevent double clicks
        
        setAnimatingNodeId(lvl.id);
        
        // Play sparkly magic arpeggio sound effect
        playSparkle();

        // Delay opening the level so the child can see the magic animation
        setTimeout(() => {
            onSelectLevel(lvl.id);
            setAnimatingNodeId(null);
        }, 900);
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
                    {levels.map((lvl) => {
                        const stars = getStars(lvl.id);
                        const isAnimating = animatingNodeId === lvl.id;
                        
                        return (
                            <motion.div
                                key={lvl.id}
                                className={`map-node node-${lvl.id}`}
                                style={{
                                    position: 'absolute',
                                    left: lvl.position.left,
                                    top: lvl.position.top,
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: isAnimating ? 300 : 50
                                }}
                                onClick={() => handleNodeClick(lvl)}
                                animate={isAnimating ? {
                                    scale: [1, 1.4, 1.25],
                                    rotate: [0, 180, 360],
                                    filter: ['drop-shadow(0px 0px 0px rgba(255,215,0,0))', 'drop-shadow(0px 0px 30px rgba(255,215,0,0.85))', 'drop-shadow(0px 0px 10px rgba(255,215,0,0.4))']
                                } : { scale: 1, rotate: 0 }}
                                transition={{ duration: 0.8, ease: 'easeInOut' }}
                            >
                                <div className="node-stars">{stars}</div>
                                <div className="node-bubble">
                                    {lvl.emoji}
                                </div>
                                <div className="node-label">{lvl.label}</div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
