import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { colorPool, shapesConfig, shapeBasketEmojis, categoryPool, distractors } from '../constants';
import { playSfx, speak, stopVoice } from '../hooks/useAudio';
import UnicornNarrator from './UnicornNarrator';

export default function SortingGame({ level, onWin, onBack }) {
    const [items, setItems] = useState([]);
    const [baskets, setBaskets] = useState([]);
    const [bubbleText, setBubbleText] = useState('');
    const [isWon, setIsWon] = useState(false);
    
    const spawningAreaRef = useRef(null);
    const basketRefs = useRef({});
    const itemRefs = useRef({});
    const startPositions = useRef({});

    // Pick random items and setup baskets
    useEffect(() => {
        setupGame();
    }, [level]);

    const setupGame = () => {
        setIsWon(false);
        stopVoice();
        startPositions.current = {};

        let activeBaskets = [];
        let itemsToSpawn = [];
        let instructionText = '';

        if (level === 1) {
            const chosenColors = [...colorPool].sort(() => 0.5 - Math.random()).slice(0, 2);
            activeBaskets = chosenColors.map(c => ({
                id: c.id,
                label: c.label,
                colorHex: c.hex,
                emoji: c.basketEmoji,
                type: 'color',
                currentCount: 0,
                targetCount: null
            }));

            chosenColors.forEach(colorDef => {
                const itemsList = [...colorDef.items].sort(() => 0.5 - Math.random()).slice(0, 2);
                itemsList.forEach(item => {
                    itemsToSpawn.push({
                        id: Math.random() + Date.now(),
                        emoji: item.emoji,
                        matchValue: colorDef.id,
                        sorted: false,
                        x: 0,
                        y: 0
                    });
                });
            });
            instructionText = 'גרור כל צעצוע לסל בצבע המתאים! לחץ על הסל להסבר';
        } else if (level === 2) {
            const chosenColors = [...colorPool].sort(() => 0.5 - Math.random()).slice(0, 2);
            activeBaskets = chosenColors.map(c => {
                const target = Math.floor(Math.random() * 3) + 2; // 2 to 4
                return {
                    id: c.id,
                    label: c.label,
                    colorHex: c.hex,
                    emoji: c.basketEmoji,
                    type: 'color',
                    currentCount: 0,
                    targetCount: target
                };
            });

            activeBaskets.forEach(basket => {
                const colorDef = colorPool.find(c => c.id === basket.id);
                for (let i = 0; i < basket.targetCount; i++) {
                    const randomItem = colorDef.items[Math.floor(Math.random() * colorDef.items.length)];
                    itemsToSpawn.push({
                        id: Math.random() + Date.now(),
                        emoji: randomItem.emoji,
                        matchValue: basket.id,
                        sorted: false,
                        x: 0,
                        y: 0
                    });
                }
            });
            instructionText = 'מיין את הצעצועים לפי מספרים וצבעים! לחץ על הסל להסבר';
        } else if (level === 3) {
            const shapes = ['circle', 'square', 'triangle'];
            activeBaskets = shapes.map(sh => ({
                id: sh,
                label: sh === 'circle' ? 'עיגולים' : sh === 'square' ? 'ריבועים' : 'משולשים',
                emoji: shapeBasketEmojis[sh],
                type: 'shape',
                currentCount: 0,
                targetCount: null
            }));

            shapes.forEach(shape => {
                const shapesList = shapesConfig.filter(s => s.shape === shape);
                const chosen = [...shapesList].sort(() => 0.5 - Math.random()).slice(0, 2);
                chosen.forEach(item => {
                    itemsToSpawn.push({
                        id: Math.random() + Date.now(),
                        emoji: item.emoji,
                        matchValue: shape,
                        sorted: false,
                        x: 0,
                        y: 0
                    });
                });
            });
            instructionText = 'מיין את הצורות לסלים המתאימים! לחץ על הסל להסבר';
        } else if (level === 4) {
            const chosenCats = [...categoryPool].sort(() => 0.5 - Math.random()).slice(0, 2);
            activeBaskets = chosenCats.map(cat => ({
                id: cat.id,
                label: cat.label,
                emoji: cat.basket,
                type: 'category',
                currentCount: 0,
                targetCount: null
            }));

            chosenCats.forEach(cat => {
                const itemsList = [...cat.items].sort(() => 0.5 - Math.random()).slice(0, 3);
                itemsList.forEach(item => {
                    itemsToSpawn.push({
                        id: Math.random() + Date.now(),
                        emoji: item.emoji,
                        matchValue: cat.id,
                        sorted: false,
                        x: 0,
                        y: 0
                    });
                });
            });

            // Add distractors
            const chosenDistractors = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 2);
            chosenDistractors.forEach(d => {
                itemsToSpawn.push({
                    id: Math.random() + Date.now(),
                    emoji: d.emoji,
                    matchValue: 'distractor',
                    sorted: false,
                    x: 0,
                    y: 0
                });
            });
            instructionText = 'מיין את הצעצועים! שים לב, חלק מהפריטים לא שייכים!';
        }

        setBaskets(activeBaskets);
        setBubbleText(instructionText);
        speak(instructionText);

        // Position items dynamically using percentage-bounds (so they always land inside spawning area)
        const positionedItems = itemsToSpawn.map((item, index) => {
            const startX = Math.floor(10 + Math.random() * 80) + '%'; // 10% to 90%
            const startY = Math.floor(10 + Math.random() * 70) + '%'; // 10% to 80%
            return {
                ...item,
                startX,
                startY,
                x: 0,
                y: 0
            };
        });
        setItems(positionedItems);
    };

    const handleDragStart = (itemId) => {
        playSfx('pop', 400);

        // Record the starting center of the item relative to the spawning area
        if (!startPositions.current[itemId]) {
            const el = itemRefs.current[itemId];
            const spawnEl = spawningAreaRef.current;
            if (el && spawnEl) {
                const rect = el.getBoundingClientRect();
                const spawnRect = spawnEl.getBoundingClientRect();
                startPositions.current[itemId] = {
                    x: rect.left + rect.width / 2 - spawnRect.left,
                    y: rect.top + rect.height / 2 - spawnRect.top
                };
            }
        }
    };

    const handleDragEnd = (itemId, event, info) => {
        const dropX = info.point.x;
        const dropY = info.point.y;

        // Find overlapping basket drop zone
        let matchedBasket = null;
        for (let b of baskets) {
            const el = basketRefs.current[b.id];
            if (el) {
                const rect = el.getBoundingClientRect();
                if (dropX >= rect.left && dropX <= rect.right && dropY >= rect.top && dropY <= rect.bottom) {
                    matchedBasket = b;
                    break;
                }
            }
        }

        const item = items.find(i => i.id === itemId);
        if (!item) return;

        if (matchedBasket) {
            if (item.matchValue === 'distractor') {
                playSfx('boink');
                speak("זה לא שייך לפה!");
                setBubbleText("זה לא שייך לפה!");
                
                // Red flash feedback
                const originalBg = basketRefs.current[matchedBasket.id].style.backgroundColor;
                basketRefs.current[matchedBasket.id].style.backgroundColor = '#ffcdd2';
                setTimeout(() => {
                    if (basketRefs.current[matchedBasket.id]) {
                        basketRefs.current[matchedBasket.id].style.backgroundColor = originalBg;
                    }
                }, 500);
                return;
            }

            if (matchedBasket.id === item.matchValue) {
                if (level === 2 && matchedBasket.currentCount >= matchedBasket.targetCount) {
                    playSfx('boink');
                    speak("הסל מלא");
                    setBubbleText("הסל הזה כבר מלא!");
                    return;
                }

                // Snap calculation
                const spawnRect = spawningAreaRef.current.getBoundingClientRect();
                const basketRect = basketRefs.current[matchedBasket.id].getBoundingClientRect();
                
                const dispersion = 24;
                const offsetX = (Math.random() - 0.5) * dispersion;
                const offsetY = (Math.random() - 0.5) * dispersion;

                // Center of target basket relative to spawn container
                const targetX = (basketRect.left + basketRect.width / 2) - spawnRect.left + offsetX;
                const targetY = (basketRect.top + basketRect.height / 2) - spawnRect.top + offsetY;

                // Calculate exact translation offset from item's percentage start position
                const dx = targetX - startPositions.current[itemId].x;
                const dy = targetY - startPositions.current[itemId].y;

                // Update basket count
                const updatedBaskets = baskets.map(b => {
                    if (b.id === matchedBasket.id) {
                        return { ...b, currentCount: b.currentCount + 1 };
                    }
                    return b;
                });
                setBaskets(updatedBaskets);

                // Update item status
                const updatedItems = items.map(i => {
                    if (i.id === itemId) {
                        return { ...i, sorted: true, x: dx, y: dy };
                    }
                    return i;
                });
                setItems(updatedItems);

                playSfx('ding', 800 + Math.random() * 400);

                // Determine voice praises
                const remaining = updatedItems.filter(i => !i.sorted && i.matchValue !== 'distractor').length;
                if (remaining <= 0) {
                    setIsWon(true);
                    playSfx('ding', 1200);
                    setTimeout(() => playSfx('ding', 1600), 200);
                    speak("כל הכבוד! את אלופה!");
                    setBubbleText("כל הכבוד! את אלופה!");
                    onWin(level);
                } else {
                    if (level === 2) {
                        const hebNumbers = ["אחת", "שתיים", "שלוש", "ארבע", "חמש"];
                        const currentVal = matchedBasket.currentCount + 1;
                        speak(hebNumbers[currentVal - 1] || "יפה");
                        setBubbleText(hebNumbers[currentVal - 1] || "יפה");
                    } else {
                        const praises = ["יפה", "מצוין", "נהדר", "כל הכבוד"];
                        const praise = praises[Math.floor(Math.random() * praises.length)];
                        speak(praise);
                        setBubbleText(praise);
                    }
                }
            } else {
                playSfx('boink');
                speak("אוי, נסה שוב");
                setBubbleText("אוי, נסה לגרור למקום אחר!");
            }
        } else {
            if (dropY < window.innerHeight / 2) {
                playSfx('boink');
                speak("אוי, נסה שוב");
            }
        }
    };

    // Speaks instruction when user taps a target basket
    const handleBasketClick = (b) => {
        if (isWon) return;
        playSfx('pop', 700);

        let msg = '';
        if (b.type === 'color') {
            msg = `גרור לכאן את כל הצעצועים בצבע ${b.label}!`;
        } else if (b.type === 'shape') {
            msg = `גרור לכאן את כל ה${b.label}!`;
        } else if (b.type === 'category') {
            msg = `גרור לכאן את כל ה${b.label}!`;
        }

        setBubbleText(msg);
        speak(msg);
    };

    return (
        <div className="view-container" id="sorting-stage-container">
            <div className="game-screen" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div className="header-bar">
                <button className="cartoon-button btn-yellow" onClick={onBack}>
                    🏠 חזור
                </button>
                <h1 className="cartoon-text-title">משחק מיון - שלב {level}</h1>
                <button className="cartoon-button btn-red" onClick={setupGame}>
                    🔄 שוב
                </button>
            </div>

            {/* Game Panel */}
            <div className="sorting-layout">
                {/* Spawning Area (top half) */}
                <div className="spawning-area" ref={spawningAreaRef}>
                    {items.map(item => (
                        <motion.div
                            key={item.id}
                            ref={el => itemRefs.current[item.id] = el}
                            className={`draggable-item ${item.sorted ? 'success' : ''}`}
                            drag={!item.sorted && !isWon}
                            dragMomentum={false}
                            dragElastic={0.5}
                            onDragStart={() => handleDragStart(item.id)}
                            onDragEnd={(e, info) => handleDragEnd(item.id, e, info)}
                            animate={item.sorted ? {
                                x: item.x,
                                y: item.y,
                                scale: 0.8,
                                rotate: 0
                            } : {
                                x: 0,
                                y: [0, -6, 0],
                                scale: 1,
                                rotate: [0, -2, 2, 0]
                            }}
                            transition={item.sorted ? { type: 'spring', stiffness: 300, damping: 25 } : {
                                y: { repeat: Infinity, duration: 2 + (item.id % 5) * 0.2, ease: 'easeInOut' },
                                rotate: { repeat: Infinity, duration: 2.5 + (item.id % 5) * 0.3, ease: 'easeInOut' }
                            }}
                            style={{
                                touchAction: 'none',
                                position: 'absolute',
                                left: item.startX,
                                top: item.startY,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            {item.emoji}
                        </motion.div>
                    ))}
                </div>

                {/* Drop Zones (bottom half) */}
                <div className="drop-zones-area">
                    {baskets.map(b => (
                        <div
                            key={b.id}
                            ref={el => basketRefs.current[b.id] = el}
                            className={`drop-basket ${b.type === 'color' ? 'color-box' : ''}`}
                            style={{
                                background: b.colorHex || undefined,
                                borderColor: b.colorHex ? 'rgba(255,255,255,0.4)' : undefined,
                                cursor: 'pointer'
                            }}
                            onClick={() => handleBasketClick(b)}
                        >
                            <div className="basket-icon">{b.emoji}</div>
                            <div className="basket-title">{b.label}</div>
                            
                            {b.targetCount !== null && (
                                <div className={`basket-count-badge ${b.currentCount >= b.targetCount ? 'complete' : ''}`}>
                                    {b.currentCount}/{b.targetCount}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Guide Narrator */}
            <UnicornNarrator 
                bubbleText={bubbleText} 
                onNarratorClick={() => speak(bubbleText)} 
            />
            </div>
        </div>
    );
}
