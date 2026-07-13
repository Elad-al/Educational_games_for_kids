import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Stage, Container, Graphics, Sprite, TilingSprite, useTick } from '@pixi/react';
import * as PIXI from 'pixi.js';
import PixiUnicorn from './PixiUnicorn';
import { playSfx, playSparkle } from '../hooks/useAudio';

const bgTexture = PIXI.Texture.from('./assets/images/magical_sky_mountains.png');

function ParallaxBackground({ width, height }) {
    const [bgX, setBgX] = useState(0);

    useTick((delta) => {
        // Slowly pan the background to the left
        setBgX(prev => prev - delta * 0.5);
    });

    return (
        <TilingSprite
            texture={bgTexture}
            width={width}
            height={height}
            tilePosition={{ x: bgX, y: 0 }}
            tileScale={{ x: height / 1024, y: height / 1024 }} // Assuming 1024px height image, scale to fit screen
            alpha={0.7} // Blend it nicely
        />
    );
}

function useSparks(isUnicornMoving, prevPosRef, targetPosRef, startTimeRef, width, height) {
    const [sparks, setSparks] = useState([]);

    useEffect(() => {
        if (!isUnicornMoving) return;

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const progress = Math.min(elapsed / 1200, 1);
            
            const pctX = prevPosRef.current.x + (targetPosRef.current.x - prevPosRef.current.x) * progress;
            const pctY = prevPosRef.current.y + (targetPosRef.current.y - prevPosRef.current.y) * progress;

            const currentX = (pctX / 100) * width;
            const currentY = (pctY / 100) * height;

            setSparks(prev => [
                ...prev.filter(s => Date.now() - s.time < 1200),
                {
                    id: Math.random(),
                    time: Date.now(),
                    x: currentX + (Math.random() - 0.5) * 20,
                    y: currentY + (Math.random() - 0.5) * 20,
                    size: 0.8 + Math.random() * 1.4,
                    floatX: (Math.random() - 0.5) * 35,
                    floatY: -20 - Math.random() * 30
                }
            ]);
        }, 50);

        return () => clearInterval(interval);
    }, [isUnicornMoving, width, height]);

    return sparks;
}

function WebGLSpark({ spark }) {
    const [age, setAge] = useState(0);

    useTick((delta) => {
        setAge(prev => prev + delta);
    });

    const progress = Math.min(age / 60, 1);
    const currentX = spark.x + spark.floatX * progress;
    const currentY = spark.y + spark.floatY * progress;
    const currentAlpha = 1 - progress;

    return (
        <Graphics 
            x={currentX}
            y={currentY}
            alpha={currentAlpha}
            draw={(g) => {
                g.clear();
                g.beginFill(0xffff00);
                g.drawCircle(0, 0, spark.size * 5);
                g.endFill();
            }}
        />
    );
}

export default function PixiMap({ type, onSelectLevel, onBack }) {
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const prevPosRef = useRef({ x: levels[0].position.x, y: levels[0].position.y });
    const targetPosRef = useRef({ x: levels[0].position.x, y: levels[0].position.y });
    const startTimeRef = useRef(0);
    const sparks = useSparks(isUnicornMoving, prevPosRef, targetPosRef, startTimeRef, dimensions.width, dimensions.height);

    const isPrincessMode = type === 'literacy';

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
        if (isUnicornMoving || animatingNodeId) return;

        prevPosRef.current = { x: unicornPos.x, y: unicornPos.y };
        targetPosRef.current = { x: lvl.position.x, y: lvl.position.y };
        startTimeRef.current = Date.now();

        setIsUnicornMoving(true);
        setUnicornPos({ x: lvl.position.x, y: lvl.position.y });
        playSfx('pop', 700);

        setTimeout(() => {
            setIsUnicornMoving(false);
            setAnimatingNodeId(lvl.id);
            playSparkle();

            setTimeout(() => {
                onSelectLevel(lvl.id);
                setAnimatingNodeId(null);
            }, 800);
        }, 1200);
    };

    const currentUnicornPxX = (unicornPos.x / 100) * dimensions.width;
    const currentUnicornPxY = (unicornPos.y / 100) * dimensions.height;

    const roadD = type === 'sorting'
        ? "M 162 225 C 220 120, 300 81, 342 81 C 420 81, 480 261, 540 261 C 600 261, 680 150, 738 112"
        : "M 162 216 Q 450 -20 720 216";

    return (
        <div className={`view-container ${isPrincessMode ? 'princess-map-view' : 'adventure-map-view'}`}>
            <div className="header-bar">
                <button className="btn-round" onClick={onBack}>🏠</button>
                <h1 className="header-title">{isPrincessMode ? 'עולם האותיות הקסום' : 'מפת הרפתקאות המיון'}</h1>
                <div style={{ width: 64 }}></div>
            </div>

            {/* DOM Overlay for interactive nodes and CSS paths */}
            <div className="map-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
                <div className="map-path" style={{ pointerEvents: 'auto' }}>
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
                                    zIndex: isAnimating ? 300 : 50,
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleNodeClick(lvl)}
                                animate={isAnimating ? {
                                    scale: [1, 1.4, 1.25],
                                    rotate: [0, 180, 360]
                                } : {
                                    y: [0, -10, 0]
                                }}
                                transition={isAnimating ? { duration: 0.8 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="node-content">
                                    <span className="node-emoji">{lvl.emoji}</span>
                                </div>
                                <div className="node-label">{lvl.label}</div>
                                {stars && <div className="node-stars">{stars}</div>}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* WebGL Canvas for High Performance Sprites & Particles */}
            <Stage 
                width={dimensions.width} 
                height={dimensions.height} 
                options={{ 
                    backgroundColor: isPrincessMode ? 0xffebee : 0xe0f7fa,
                    antialias: true,
                    resolution: window.devicePixelRatio || 1
                }}
                style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            >
                <ParallaxBackground width={dimensions.width} height={dimensions.height} />
                
                <Container>
                    <PixiUnicorn 
                        x={currentUnicornPxX} 
                        y={currentUnicornPxY} 
                        isGalloping={isUnicornMoving} 
                    />

                    {sparks.map(spark => (
                        <WebGLSpark key={spark.id} spark={spark} />
                    ))}
                </Container>
            </Stage>
        </div>
    );
}
