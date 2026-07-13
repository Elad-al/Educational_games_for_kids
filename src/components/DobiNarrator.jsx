import React, { useState } from 'react';
import { playSfx } from '../hooks/useAudio';

export default function DobiNarrator({ bubbleText, onNarratorClick }) {
    const [tapCount, setTapCount] = useState(0);

    const handleDobiTap = () => {
        // Play funny pop sound when tapped
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
            
            <div className="dobi-avatar" onClick={handleDobiTap}>
                <div className="dobi-ear-l"></div>
                <div className="dobi-ear-r"></div>
                <div className="dobi-bear">
                    <div className="dobi-eye-l"></div>
                    <div className="dobi-eye-r"></div>
                    <div className="dobi-blush-l"></div>
                    <div className="dobi-blush-r"></div>
                    <div className="dobi-snout">
                        <div className="dobi-nose"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
