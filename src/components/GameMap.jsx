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
                                </defs>

                                {/* Tail */}
                                <path 
                                    className="uni-tail-path" 
                                    d="M 22 55 Q 5 60 10 75 Q 18 78 24 63 Z" 
                                    fill="url(#uniHairGrad)" 
                                    stroke="#4a148c" 
                                    strokeWidth="1.5" 
                                />
                                
                                {/* Right Back Leg */}
                                <path 
                                    className="uni-leg-br-path" 
                                    d="M 28 60 C 26 75, 23 85, 25 90 C 28 90, 31 82, 33 60 Z" 
                                    fill="#fce4ec" 
                                    stroke="#c2185b" 
                                    strokeWidth="1.5" 
                                />
                                
                                {/* Right Front Leg */}
                                <path 
                                    className="uni-leg-fr-path" 
                                    d="M 68 60 C 69 75, 71 85, 73 90 C 76 90, 75 82, 72 60 Z" 
                                    fill="#fce4ec" 
                                    stroke="#c2185b" 
                                    strokeWidth="1.5" 
                                />
                                
                                {/* Torso Body */}
                                <path 
                                    d="M 26 44 C 18 44, 16 56, 22 66 C 26 72, 68 72, 72 64 C 77 54, 71 44, 65 44 Z" 
                                    fill="url(#uniBodyGrad)" 
                                    stroke="#c2185b" 
                                    strokeWidth="1.8" 
                                />
                                
                                {/* Left Back Leg */}
                                <path 
                                    className="uni-leg-bl-path" 
                                    d="M 33 60 C 33 75, 31 85, 33 90 C 36 90, 38 82, 38 60 Z" 
                                    fill="#f8bbd0" 
                                    stroke="#c2185b" 
                                    strokeWidth="1.5" 
                                />
                                
                                {/* Left Front Leg */}
                                <path 
                                    className="uni-leg-fl-path" 
                                    d="M 63 60 C 62 75, 59 85, 61 90 C 64 90, 67 82, 67 60 Z" 
                                    fill="#f8bbd0" 
                                    stroke="#c2185b" 
                                    strokeWidth="1.5" 
                                />

                                {/* Neck */}
                                <path 
                                    d="M 62 48 C 65 40, 71 28, 73 22 C 76 25, 74 38, 70 48 Z" 
                                    fill="url(#uniBodyGrad)" 
                                    stroke="#c2185b" 
                                    strokeWidth="1.8" 
                                />
                                
                                {/* Head Group (for look-around and smile animations) */}
                                <g className="uni-head-group">
                                    {/* Head base */}
                                    <path 
                                        d="M 68 22 C 64 20, 68 8, 76 8 C 84 8, 86 16, 82 26 C 78 30, 72 28, 68 22 Z" 
                                        fill="url(#uniBodyGrad)" 
                                        stroke="#c2185b" 
                                        strokeWidth="1.8" 
                                    />
                                    
                                    {/* Eye with Shiny Highlight */}
                                    <circle cx="76" cy="14" r="2.5" fill="#2d3748" />
                                    <circle cx="75.2" cy="13" r="0.9" fill="#fff" />
                                    
                                    {/* Cute smiling mouth */}
                                    <path d="M 79 21 Q 81 23 83 20" fill="none" stroke="#c2185b" strokeWidth="1.2" strokeLinecap="round" />
                                    
                                    {/* Blush cheek */}
                                    <circle cx="73" cy="18" r="3" fill="#ff4081" opacity="0.5" />
                                    
                                    {/* Golden horn */}
                                    <path 
                                        className="uni-horn-path" 
                                        d="M 72 6 L 68 -10 L 76 4 Z" 
                                        fill="url(#uniHornGrad)" 
                                        stroke="#e65100" 
                                        strokeWidth="1.2" 
                                    />
                                    
                                    {/* Mane (Hair) */}
                                    <path 
                                        className="uni-mane-path" 
                                        d="M 60 30 Q 52 20 62 12 Q 54 8 68 6 Q 66 18 60 30 Z" 
                                        fill="url(#uniHairGrad)" 
                                        stroke="#4a148c" 
                                        strokeWidth="1.2" 
                                    />
                                    
                                    {/* Ear */}
                                    <path d="M 66 10 Q 62 0 68 4 Z" fill="#ff80ab" stroke="#c2185b" strokeWidth="1.2" />
                                </g>
                            </svg>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
