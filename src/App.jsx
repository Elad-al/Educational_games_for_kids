import React, { useState, useEffect } from 'react';
import { initAudioEngine, playSfx, speak } from './hooks/useAudio';
import GameMap from './components/GameMap';
import SortingGame from './components/SortingGame';
import LiteracyGame from './components/LiteracyGame';
import BalloonOverlay from './components/BalloonOverlay';
import StickerBoard from './components/StickerBoard';

export default function App() {
    const [view, setView] = useState('menu'); // 'menu', 'map-sorting', 'map-literacy', 'game-sorting', 'game-literacy'
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [showWin, setShowWin] = useState(false);
    const [showSticker, setShowSticker] = useState(false);

    // Bulletproof tablet audio unlock on first pointer interaction
    useEffect(() => {
        const handleInteraction = () => {
            initAudioEngine();
            // Remove listeners once unlocked
            document.removeEventListener('pointerdown', handleInteraction);
            document.removeEventListener('click', handleInteraction);
        };
        document.addEventListener('pointerdown', handleInteraction);
        document.addEventListener('click', handleInteraction);
        
        return () => {
            document.removeEventListener('pointerdown', handleInteraction);
            document.removeEventListener('click', handleInteraction);
        };
    }, []);

    const handleSelectView = (targetView) => {
        playSfx('pop', 600);
        setView(targetView);
    };

    const handleGameWin = (levelId) => {
        // Record win in localStorage
        const progressKey = view === 'game-sorting' ? 'sortingProgress' : 'literacyProgress';
        try {
            const currentProgress = JSON.parse(localStorage.getItem(progressKey) || '{}');
            if (!currentProgress[levelId]) {
                currentProgress[levelId] = { wins: 0 };
            }
            currentProgress[levelId].wins += 1;
            localStorage.setItem(progressKey, JSON.stringify(currentProgress));
        } catch (e) {
            console.error('Error saving progress:', e);
        }

        // Trigger balloon pop overlay
        setTimeout(() => {
            setShowWin(true);
        }, 1200);
    };

    const handleWinOverlayContinue = () => {
        setShowWin(false);
        // Take to Sticker Board scene
        setShowSticker(true);
    };

    const handleStickerBoardDone = () => {
        setShowSticker(false);
        // Return to the respective map
        if (view === 'game-sorting') {
            setView('map-sorting');
        } else {
            setView('map-literacy');
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            
            {/* Interactive Background */}
            <div className="game-background">
                <div className="sky-gradient" />
                <div className="clouds-layer">
                    <div className="cloud cloud-1" />
                    <div className="cloud cloud-2" />
                    <div className="cloud cloud-3" />
                </div>
                <div 
                    className="interactive-sun" 
                    onClick={() => playSfx('pop', 900)}
                />
                <div className="hills-layer">
                    <div className="hill hill-back" />
                    <div className="hill hill-front" onClick={() => playSfx('pop', 300)} />
                </div>
            </div>

            {/* View State Machine Router */}
            <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%' }}>
                {view === 'menu' && (
                    <div className="main-menu">
                        <h1 className="menu-title">עולם המשחקים הקסום</h1>
                        <div className="menu-buttons">
                            <button 
                                className="menu-btn btn-sorting"
                                onClick={() => handleSelectView('map-sorting')}
                            >
                                <span className="icon">🦁🎨</span>
                                <span>משחקי מיון</span>
                            </button>
                            <button 
                                className="menu-btn btn-literacy"
                                onClick={() => handleSelectView('map-literacy')}
                            >
                                <span className="icon">א ב ג</span>
                                <span>לימוד אותיות</span>
                            </button>
                        </div>
                    </div>
                )}

                {view === 'map-sorting' && (
                    <GameMap 
                        type="sorting" 
                        onSelectLevel={(lvl) => {
                            setSelectedLevel(lvl);
                            setView('game-sorting');
                        }}
                        onBack={() => setView('menu')}
                    />
                )}

                {view === 'map-literacy' && (
                    <GameMap 
                        type="literacy" 
                        onSelectLevel={(lvl) => {
                            setSelectedLevel(lvl);
                            setView('game-literacy');
                        }}
                        onBack={() => setView('menu')}
                    />
                )}

                {view === 'game-sorting' && (
                    <SortingGame 
                        level={selectedLevel}
                        onWin={handleGameWin}
                        onBack={() => setView('map-sorting')}
                    />
                )}

                {view === 'game-literacy' && (
                    <LiteracyGame 
                        stage={selectedLevel}
                        onWin={handleGameWin}
                        onBack={() => setView('map-literacy')}
                    />
                )}
            </div>

            {/* Overlays */}
            {showWin && (
                <BalloonOverlay onContinue={handleWinOverlayContinue} />
            )}

            {showSticker && (
                <StickerBoard onBack={handleStickerBoardDone} />
            )}
        </div>
    );
}
