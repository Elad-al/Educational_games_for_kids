import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { stickerPool, stickerScenes } from '../constants';
import { playSfx } from '../hooks/useAudio';

export default function StickerBoard({ onBack }) {
    const [selectedScene, setSelectedScene] = useState(stickerScenes[0]);
    const [placedStickers, setPlacedStickers] = useState([]);

    const handleAddSticker = (sticker) => {
        playSfx('pop', 600 + Math.random() * 200);
        // Spawn sticker in the center of the canvas
        const newSticker = {
            id: Date.now() + Math.random(),
            emoji: sticker.emoji,
            x: 50, // Initial percentage center x
            y: 50  // Initial percentage center y
        };
        setPlacedStickers(prev => [...prev, newSticker]);
    };

    const handleClear = () => {
        playSfx('boink');
        setPlacedStickers([]);
    };

    return (
        <div className="sticker-board-overlay">
            <div className="sticker-container">
                <div className="sticker-header">
                    🎨 לוח המדבקות הקסום שלי 🎨
                </div>

                <div className="sticker-content-split">
                    {/* Active Canvas Scene */}
                    <div 
                        className="sticker-scene-canvas" 
                        style={{ background: selectedScene.background }}
                    >
                        {placedStickers.map(st => (
                            <motion.div
                                key={st.id}
                                className="sticker-placed"
                                drag
                                dragMomentum={false}
                                dragElastic={0}
                                style={{
                                    left: `${st.x}%`,
                                    top: `${st.y}%`,
                                    touchAction: 'none'
                                }}
                                onDragStart={() => playSfx('pop', 500)}
                            >
                                {st.emoji}
                            </motion.div>
                        ))}
                    </div>

                    {/* Side panel drawer */}
                    <div className="sticker-drawer">
                        <h3>בחר רקע:</h3>
                        <div className="scene-select-row">
                            {stickerScenes.map(sc => (
                                <button
                                    key={sc.id}
                                    className={`scene-select-btn ${selectedScene.id === sc.id ? 'active' : ''}`}
                                    onClick={() => {
                                        playSfx('pop', 700);
                                        setSelectedScene(sc);
                                    }}
                                >
                                    {sc.name}
                                </button>
                            ))}
                        </div>

                        <h3>מדבקות:</h3>
                        <div className="sticker-list">
                            {stickerPool.map(st => (
                                <button
                                    key={st.id}
                                    className="sticker-item"
                                    onClick={() => handleAddSticker(st)}
                                >
                                    {st.emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="sticker-footer">
                    <button className="btn-primary" onClick={handleClear} style={{ backgroundColor: '#e53935', marginLeft: 'auto' }}>
                        מחק הכל 🗑️
                    </button>
                    <button className="btn-primary" onClick={onBack}>
                        סיום ושמירה 💾
                    </button>
                </div>
            </div>
        </div>
    );
}
