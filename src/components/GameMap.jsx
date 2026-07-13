import React, { useState, useEffect, useRef } from 'react';
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
    const [isUnicornMoving, setIsUnicornMoving] = useState(false);
    const [sparks, setSparks] = useState([]);

    const prevPosRef = useRef({ x: levels[0].position.x, y: levels[0].position.y });
    const targetPosRef = useRef({ x: levels[0].position.x, y: levels[0].position.y });
    const startTimeRef = useRef(0);

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

    // Stardust trail emitter interval
    useEffect(() => {
        if (!isUnicornMoving) return;

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const progress = Math.min(elapsed / 1200, 1);
            
            const currentX = prevPosRef.current.x + (targetPosRef.current.x - prevPosRef.current.x) * progress;
            const currentY = prevPosRef.current.y + (targetPosRef.current.y - prevPosRef.current.y) * progress;

            // Spawn 2 sparkles per tick for rich visual volume
            setSparks(prev => [
                ...prev.filter(s => Date.now() - s.time < 1200),
                {
                    id: Math.random(),
                    time: Date.now(),
                    x: currentX + (Math.random() - 0.5) * 5,
                    y: currentY + (Math.random() - 0.5) * 5,
                    size: `${0.8 + Math.random() * 1.4}rem`,
                    floatX: (Math.random() - 0.5) * 35,
                    floatY: -20 - Math.random() * 30
                },
                {
                    id: Math.random() + 1,
                    time: Date.now(),
                    x: currentX + (Math.random() - 0.5) * 5,
                    y: currentY + (Math.random() - 0.5) * 5,
                    size: `${0.6 + Math.random() * 1}rem`,
                    floatX: (Math.random() - 0.5) * 20,
                    floatY: -10 - Math.random() * 20
                }
            ]);
        }, 50);

        return () => clearInterval(interval);
    }, [isUnicornMoving]);

    const handleNodeClick = (lvl) => {
        if (isUnicornMoving || animatingNodeId) return;

        // Configure motion coordinates
        prevPosRef.current = { x: unicornPos.x, y: unicornPos.y };
        targetPosRef.current = { x: lvl.position.x, y: lvl.position.y };
        startTimeRef.current = Date.now();

        setIsUnicornMoving(true);
        setUnicornPos({ x: lvl.position.x, y: lvl.position.y });
        playSfx('pop', 700);

        // Slide animation takes 1200ms
        setTimeout(() => {
            setIsUnicornMoving(false);
            setAnimatingNodeId(lvl.id);
            playSparkle();

            // Node selection spin takes 800ms
            setTimeout(() => {
                onSelectLevel(lvl.id);
                setAnimatingNodeId(null);
            }, 800);
        }, 1200);
    };

    const isPrincessMode = type === 'literacy';

    // Mathematically aligned Bezier curves
    const roadD = type === 'sorting'
        ? "M 162 225 C 220 120, 300 81, 342 81 C 420 81, 480 261, 540 261 C 600 261, 680 150, 738 112"
        : "M 162 216 Q 450 -20 720 216";

    return (
        <div className={`view-container ${isPrincessMode ? 'princess-map-view' : 'adventure-map-view'}`}>
            {/* Header */}
            <div className="header-bar">
                <button className="btn-round" onClick={onBack}>
                    🏠
                </button>
                <h1 className="header-title">
                    {isPrincessMode ? 'עולם האותיות הקסום' : 'מפת הרפתקאות המיון'}
                </h1>
                <div style={{ width: 64 }}></div>
            </div>

            <div className="map-container">
                <div className="map-path">
                    
                    {/* Themed background details */}
                    {!isPrincessMode ? (
                        <>
                            {/* Adventure World Details */}
                            <div className="adventure-mole">🐹</div>
                            <div className="adventure-chest">📦</div>
                            <div className="map-detail tree-1">🌳</div>
                            <div className="map-detail tree-2">🌳</div>
                        </>
                    ) : (
                        <>
                            {/* Princess World Details */}
                            <div className="princess-castle">🏰</div>
                            <div className="princess-rainbow">🌈</div>
                            <div className="map-detail star-glow-1">✨</div>
                            <div className="map-detail star-glow-2">✨</div>
                        </>
                    )}

                    {/* Winding Adventure path road */}
                    <svg className="road-path-svg" width="100%" height="100%" viewBox="0 0 900 450" preserveAspectRatio="none">
                        <path 
                            d={roadD}
                            fill="none" 
                            stroke={isPrincessMode ? "url(#goldGradient)" : "url(#sandGradient)"} 
                            strokeWidth="20" 
                            strokeLinecap="round"
                            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
                        />
                        <path 
                            d={roadD}
                            fill="none" 
                            stroke="#fff" 
                            strokeWidth="4" 
                            strokeDasharray="16, 16"
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ffee58" />
                                <stop offset="50%" stopColor="#fdd835" />
                                <stop offset="100%" stopColor="#f57f17" />
                            </linearGradient>
                            <linearGradient id="sandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ffe082" />
                                <stop offset="100%" stopColor="#ffb300" />
                            </linearGradient>
                        </defs>
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
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
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

                    {/* Magic stardust trail sparks */}
                    {sparks.map(s => (
                        <motion.div
                            key={s.id}
                            initial={{ left: `${s.x}%`, top: `${s.y}%`, scale: 1.6, opacity: 1 }}
                            animate={{ 
                                x: s.floatX, 
                                y: s.floatY, 
                                scale: 0.2, 
                                opacity: 0,
                                rotate: 360 
                            }}
                            transition={{ duration: 1.1, ease: 'easeOut' }}
                            style={{
                                position: 'absolute',
                                fontSize: s.size,
                                pointerEvents: 'none',
                                zIndex: 85,
                                transform: 'translate(-50%, -50%)',
                                filter: 'drop-shadow(0 0 8px #ffd700)'
                            }}
                        >
                            ✨
                        </motion.div>
                    ))}

                    {/* CSS Animated Riding Unicorn Avatar */}
                    <motion.div
                        className={`unicorn-character ${isUnicornMoving ? 'galloping' : 'idle'}`}
                        animate={{
                            left: `${unicornPos.x}%`,
                            top: `${unicornPos.y}%`
                        }}
                        transition={{ duration: 1.2, ease: 'easeInOut' }}
                    >
                        <div className="unicorn-body-wrapper">
                            <svg className="unicorn-svg-char" viewBox="0 0 100 100" width="100%" height="100%">
                                <defs>
                                    <linearGradient id="uniBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#ffffff" />
                                        <stop offset="40%" stopColor="#fce4ec" />
                                        <stop offset="100%" stopColor="#f8bbd0" />
                                    </linearGradient>
                                    <linearGradient id="uniHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#ea80fc" />
                                        <stop offset="50%" stopColor="#d500f9" />
                                        <stop offset="100%" stopColor="#7c4dff" />
                                    </linearGradient>
                                    <linearGradient id="uniHornGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#ffee58" />
                                        <stop offset="100%" stopColor="#ffb300" />
                                    </linearGradient>
                                    <linearGradient id="maneYellow" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#fff59d" /><stop offset="100%" stopColor="#fbc02d" />
                                    </linearGradient>
                                    <linearGradient id="maneGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#a5d6a7" /><stop offset="100%" stopColor="#388e3c" />
                                    </linearGradient>
                                    <linearGradient id="maneBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#80deea" /><stop offset="100%" stopColor="#00acc1" />
                                    </linearGradient>
                                    <linearGradient id="manePink" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#ff8a80" /><stop offset="100%" stopColor="#d32f2f" />
                                    </linearGradient>
                                    <linearGradient id="manePurple" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#b39ddb" /><stop offset="100%" stopColor="#5e35b1" />
                                    </linearGradient>
                                </defs>

                                {/* Tail - Sweeping lock of rainbow hair */}
                                <g className="uni-tail-group">
                                    <path className="uni-tail-path" d="M 28 65 Q 10 60 5 75 Q 12 95 24 95 Q 26 80 28 65 Z" fill="url(#manePurple)" stroke="#311b92" strokeWidth="1.5" />
                                    <path className="uni-tail-path" d="M 26 68 Q 12 68 8 82 Q 15 92 23 88 Q 24 78 26 68 Z" fill="url(#maneBlue)" stroke="#006064" strokeWidth="1.5" />
                                    <path className="uni-tail-path" d="M 24 72 Q 14 74 12 85 Q 18 90 22 84 Q 22 78 24 72 Z" fill="url(#maneGreen)" stroke="#1b5e20" strokeWidth="1.5" />
                                    <path className="uni-tail-path" d="M 22 75 Q 16 78 15 82 Q 18 85 20 82 Q 20 78 22 75 Z" fill="url(#maneYellow)" stroke="#f57f17" strokeWidth="1.5" />
                                </g>

                                {/* Back legs (drawn behind body) */}
                                <g className="uni-legs-back">
                                    {/* Back leg right */}
                                    <g className="uni-leg-br-path">
                                        <path d="M 32 68 L 26 95 A 4 4 0 0 0 32 99 L 38 99 L 38 68 Z" fill="url(#uniBodyGrad)" opacity="0.85" stroke="#ad1457" strokeWidth="1.5" />
                                        <path d="M 26 95 L 38 95 L 38 99 L 32 99 Z" fill="#ff4081" /> {/* hoof */}
                                    </g>
                                    {/* Front leg right */}
                                    <g className="uni-leg-fr-path">
                                        <path d="M 64 68 L 58 95 A 4 4 0 0 0 64 99 L 70 99 L 70 68 Z" fill="url(#uniBodyGrad)" opacity="0.85" stroke="#ad1457" strokeWidth="1.5" />
                                        <path d="M 58 95 L 70 95 L 70 99 L 64 99 Z" fill="#ff4081" /> {/* hoof */}
                                    </g>
                                </g>

                                {/* Torso Body */}
                                <path 
                                    d="M 28 50 C 22 50, 18 62, 24 72 C 30 78, 66 78, 70 70 C 76 60, 72 50, 64 50 Z" 
                                    fill="url(#uniBodyGrad)" 
                                    stroke="#c2185b" 
                                    strokeWidth="2" 
                                />

                                {/* Front legs (drawn in front of body) */}
                                <g className="uni-legs-front">
                                    {/* Back leg left */}
                                    <g className="uni-leg-bl-path">
                                        <path d="M 38 68 L 34 95 A 4 4 0 0 0 40 99 L 46 99 L 44 68 Z" fill="url(#uniBodyGrad)" stroke="#c2185b" strokeWidth="2" />
                                        <path d="M 34 95 L 46 95 L 46 99 L 40 99 Z" fill="#f50057" /> {/* hoof */}
                                    </g>
                                    {/* Front leg left */}
                                    <g className="uni-leg-fl-path">
                                        <path d="M 70 68 L 66 95 A 4 4 0 0 0 72 99 L 78 99 L 76 68 Z" fill="url(#uniBodyGrad)" stroke="#c2185b" strokeWidth="2" />
                                        <path d="M 66 95 L 78 95 L 78 99 L 72 99 Z" fill="#f50057" /> {/* hoof */}
                                    </g>
                                </g>

                                {/* Neck */}
                                <path 
                                    d="M 64 52 C 67 44, 72 32, 75 24 C 80 27, 78 40, 72 52 Z" 
                                    fill="url(#uniBodyGrad)" 
                                    stroke="#c2185b" 
                                    strokeWidth="2" 
                                />

                                {/* Head Group (for look-around and breathing) */}
                                <g className="uni-head-group">
                                    {/* Head shape with muzzle */}
                                    <path 
                                        d="M 70 24 C 65 22, 64 12, 74 10 C 84 10, 88 18, 83 28 C 78 33, 72 30, 70 24 Z" 
                                        fill="url(#uniBodyGrad)" 
                                        stroke="#c2185b" 
                                        strokeWidth="2" 
                                    />
                                    
                                    {/* Muzzle curve */}
                                    <path d="M 80 26 Q 84 28 85 24" fill="none" stroke="#c2185b" strokeWidth="1.5" />
                                    {/* Nostril */}
                                    <circle cx="82" cy="24" r="1" fill="#c2185b" />
                                    
                                    {/* Eye - Big and Cute with dual catchlights & eyelashes */}
                                    <g className="uni-eye-group">
                                        <path d="M 70 12 C 73 10, 77 11, 79 13" fill="none" stroke="#2d3748" strokeWidth="2.5" strokeLinecap="round" />
                                        <path d="M 78 11 L 81 9" stroke="#2d3748" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M 75 10 L 76 7" stroke="#2d3748" strokeWidth="1.5" strokeLinecap="round" />
                                        
                                        <ellipse cx="75" cy="17" rx="5" ry="6" fill="#2d3748" />
                                        <ellipse cx="74" cy="15" rx="2" ry="2.5" fill="#fff" />
                                        <circle cx="76.5" cy="19" r="1" fill="#fff" />
                                        
                                        <path d="M 68 9 Q 73 7 77 9" fill="none" stroke="#c2185b" strokeWidth="2.2" strokeLinecap="round" />
                                    </g>

                                    {/* Blush cheek */}
                                    <ellipse cx="72" cy="22" rx="4" ry="2.5" fill="#ff4081" opacity="0.5" />

                                    {/* Golden spiral horn */}
                                    <g className="uni-horn">
                                        <path className="uni-horn-path" d="M 73 8 L 52 -10 L 77 2 Z" fill="url(#hornGrad)" stroke="#f57f17" strokeWidth="1.5" />
                                        <path d="M 70 4 Q 66 1 62 -2" fill="none" stroke="#e65100" strokeWidth="1.5" />
                                        <path d="M 64 -3 Q 60 -6 56 -8" fill="none" stroke="#e65100" strokeWidth="1.5" />
                                    </g>

                                    {/* Rainbow Mane locks */}
                                    <g className="uni-mane-group">
                                        <path className="uni-mane-path" d="M 66 32 Q 52 20 62 10 Q 56 6 68 4 Q 66 18 66 32 Z" fill="url(#maneYellow)" stroke="#f57f17" strokeWidth="1.2" />
                                        <path className="uni-mane-path" d="M 64 35 Q 50 25 59 15 Q 53 11 65 9 Q 63 21 64 35 Z" fill="url(#maneGreen)" stroke="#1b5e20" strokeWidth="1.2" />
                                        <path className="uni-mane-path" d="M 62 38 Q 48 30 56 20 Q 50 16 62 14 Q 60 24 62 38 Z" fill="url(#maneBlue)" stroke="#006064" strokeWidth="1.2" />
                                        <path className="uni-mane-path" d="M 60 41 Q 46 35 53 25 Q 47 21 59 19 Q 57 27 60 41 Z" fill="url(#manePink)" stroke="#b71c1c" strokeWidth="1.2" />
                                    </g>

                                    {/* Ears */}
                                    <g className="uni-ears">
                                        <path d="M 66 10 Q 60 0 66 4 Z" fill="url(#uniBodyGrad)" stroke="#c2185b" strokeWidth="1.5" />
                                        <path d="M 65 8 Q 61 2 64 5 Z" fill="#ff80ab" />
                                    </g>
                                </g>
                            </svg>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
