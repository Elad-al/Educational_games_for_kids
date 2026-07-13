import React, { useState, useEffect } from 'react';
import { initAudioEngine, playSfx, speak, playGiggle } from './hooks/useAudio';
import AdventureMap from './components/AdventureMap';
import SortingGame from './components/SortingGame';
import LiteracyGame from './components/LiteracyGame';
import BalloonOverlay from './components/BalloonOverlay';
import StickerBoard from './components/StickerBoard';
import MagicWorldLayout from './components/MagicWorldLayout';
import { motion, AnimatePresence } from 'framer-motion';

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
        <MagicWorldLayout>
            <AnimatePresence mode="wait">
                {view === 'menu' && (
                    <motion.div 
                        key="menu"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="main-menu"
                    >
                        <h1 className="cartoon-text-title" style={{ fontSize: '4rem', marginBottom: '40px' }}>עולם המשחקים הקסום</h1>
                        <div className="menu-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                            <button 
                                className="cartoon-button btn-yellow"
                                style={{ width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}
                                onClick={() => handleSelectView('map-sorting')}
                            >
                                <span className="icon" style={{ fontSize: '2.5rem' }}>🦁</span>
                                <span>משחקי מיון</span>
                            </button>
                            <button 
                                className="cartoon-button btn-red"
                                style={{ width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}
                                onClick={() => handleSelectView('map-literacy')}
                            >
                                <span className="icon" style={{ fontSize: '2.5rem' }}>א ב</span>
                                <span>לימוד אותיות</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                {view === 'map-sorting' && (
                    <motion.div key="map-sorting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', height: '100%' }}>
                        <AdventureMap 
                            type="sorting" 
                            onSelectLevel={(level) => {
                                setSelectedLevel(level);
                                handleSelectView('game-sorting');
                            }}
                            onBack={() => handleSelectView('menu')}
                        />
                    </motion.div>
                )}

                {view === 'map-literacy' && (
                    <motion.div key="map-literacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', height: '100%' }}>
                        <AdventureMap 
                            type="literacy" 
                            onSelectLevel={(level) => {
                                setSelectedLevel(level);
                                handleSelectView('game-literacy');
                            }}
                            onBack={() => handleSelectView('menu')}
                        />
                    </motion.div>
                )}

                {view === 'game-sorting' && (
                    <motion.div key="game-sorting" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} style={{ width: '100%', height: '100%' }}>
                        <SortingGame 
                            level={selectedLevel}
                            onWin={handleGameWin}
                            onBack={() => setView('map-sorting')}
                        />
                    </motion.div>
                )}

                {view === 'game-literacy' && (
                    <motion.div key="game-literacy" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} style={{ width: '100%', height: '100%' }}>
                        <LiteracyGame 
                            stage={selectedLevel}
                            onWin={handleGameWin}
                            onBack={() => setView('map-literacy')}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showWin && (
                    <BalloonOverlay onContinue={handleWinOverlayContinue} />
                )}

                {showSticker && (
                    <StickerBoard onBack={handleStickerBoardDone} />
                )}
            </AnimatePresence>
        </MagicWorldLayout>
    );
}
