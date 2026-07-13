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
                            <img 
                                src="./assets/images/disney_pink_unicorn.png" 
                                alt="Unicorn" 
                                className="unicorn-disney-img"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    mixBlendMode: 'multiply'
                                }}
                            />
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
