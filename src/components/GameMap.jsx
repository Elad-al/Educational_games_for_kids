import React from 'react';
import { playSfx } from '../hooks/useAudio';

export default function GameMap({ type, onSelectLevel, onBack }) {
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

    // Check if a level is locked
    const isLocked = (levelIndex) => {
        if (levelIndex === 1) return false;
        const progressKey = type === 'sorting' ? 'sortingProgress' : 'literacyProgress';
        try {
            const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
            // Previous level must have at least 1 win
            const prevLevelData = progress[levelIndex - 1];
            return !prevLevelData || prevLevelData.wins < 1;
        } catch (e) {
            return true;
        }
    };

    const levels = type === 'sorting' ? [
        { id: 1, label: 'צבעים', emoji: '🎨', description: 'מיון לפי צבעים' },
        { id: 2, label: 'מספרים וצבעים', emoji: '🔢', description: 'מיון וספירת צעצועים' },
        { id: 3, label: 'צורות', emoji: '📐', description: 'מיון לפי צורות הנדסיות' },
        { id: 4, label: 'קטגוריות', emoji: '🦁', description: 'חיות, פירות, חללית ורכבים' }
    ] : [
        { id: 1, label: 'הכרת האותיות', emoji: 'א', description: 'גרירת אות לצללית שלה' },
        { id: 2, label: 'חיפוש אותיות', emoji: '🔍', description: 'מצא את האות המבוקשת' },
        { id: 3, label: 'שרביט קסמים', emoji: '🪄', description: 'התאמת אות ראשונה למילה' }
    ];

    const handleNodeClick = (lvl) => {
        if (isLocked(lvl.id)) {
            playSfx('boink');
            return;
        }
        playSfx('pop', 800);
        onSelectLevel(lvl.id);
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
                    {levels.map((lvl, index) => {
                        const locked = isLocked(lvl.id);
                        const stars = getStars(lvl.id);
                        return (
                            <div
                                key={lvl.id}
                                className={`map-node node-${lvl.id} ${locked ? 'locked' : ''}`}
                                onClick={() => handleNodeClick(lvl)}
                            >
                                <div className="node-stars">{stars}</div>
                                <div className="node-bubble">
                                    {lvl.emoji}
                                    {locked && (
                                        <div className="node-lock-icon">🔒</div>
                                    )}
                                </div>
                                <div className="node-label">{lvl.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
