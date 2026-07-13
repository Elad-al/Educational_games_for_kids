import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { colorPool, shapesConfig, shapeBasketEmojis, categoryPool, distractors } from '../constants';
import { playSfx, speak, stopVoice } from '../hooks/useAudio';
import DobiNarrator from './DobiNarrator';

export default function SortingGame({ level, onWin, onBack }) {
    const [items, setItems] = useState([]);
    const [baskets, setBaskets] = useState([]);
    const [bubbleText, setBubbleText] = useState('');
    const [isWon, setIsWon] = useState(false);
    
    const spawningAreaRef = useRef(null);
    const basketRefs = useRef({});

    // Pick random items and setup baskets
    useEffect(() => {
        setupGame();
    }, [level]);

    const setupGame = () => {
        setIsWon(false);
        stopVoice();

        let activeBaskets = [];
        let itemsToSpawn = [];
        let instructionText = '';

        if (level === 1) {
            // Level 1: 2 random colors, 2 items per color = 4 items
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
                        y: 0,
                        startX: 0,
                        startY: 0
                    });
                });
            });
            instructionText = 'גרור כל צעצוע לסל בצבע המתאים!';
        } else if (level === 2) {
            // Level 2: 2 random colors, exact count (2 to 4)
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
                // Spawn exact count of items
                for (let i = 0; i < basket.targetCount; i++) {
                    const randomItem = colorDef.items[Math.floor(Math.random() * colorDef.items.length)];
                    itemsToSpawn.push({
                        id: Math.random() + Date.now(),
                        emoji: randomItem.emoji,
                        matchValue: basket.id,
                        sorted: false,
                        x: 0,
                        y: 0,
                        startX: 0,
                        startY: 0
                    });
                }
            });
            instructionText = 'מיין את הצעצועים לפי מספרים וצבעים!';
        } else if (level === 3) {
            // Level 3: shapes (circle, square, triangle), 2 items each
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
                        y: 0,
                        startX: 0,
                        startY: 0
                    });
                });
            });
            instructionText = 'מיין את הצורות לסלים המתאימים!';
        } else if (level === 4) {
            // Level 4: Categories + 2 distractors
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
                        y: 0,
                        startX: 0,
                        startY: 0
                    });
                });
            });

            // Add 2 distractors
            const chosenDistractors = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 2);
            chosenDistractors.forEach(d => {
                itemsToSpawn.push({
                    id: Math.random() + Date.now(),
                    emoji: d.emoji,
                    matchValue: 'distractor',
                    sorted: false,
                    x: 0,
                    y: 0,
                    startX: 0,
                    startY: 0
                });
            });
            instructionText = 'מיין את הצעצועים! שים לב, חלק מהפריטים לא שייכים!';
        }

        setBaskets(activeBaskets);
        setBubbleText(instructionText);
        speak(instructionText);

        // Compute starting positions in spawning area after rendering
        setTimeout(() => {
            if (!spawningAreaRef.current) return;
            const container = spawningAreaRef.current.getBoundingClientRect();
            
            const positionedItems = itemsToSpawn.map((item, index) => {
                const pad = 50;
                const maxX = Math.max(container.width - pad * 2, 100);
                const maxY = Math.max(container.height - pad * 2, 80);

                const startX = pad + Math.random() * maxX;
                const startY = pad + Math.random() * maxY;

                return {
                    ...item,
                    x: startX,
                    y: startY,
                    startX,
                    startY
                };
            });
            setItems(positionedItems);
        }, 100);
    };

    const handleDragStart = () => {
        playSfx('pop', 400);
    };

    const handleDragEnd = (itemId, event, info) => {
        const dropX = info.point.x;
        const dropY = info.point.y;

        // Find which basket bounds contain (dropX, dropY)
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
            // 1. Distractor logic
            if (item.matchValue === 'distractor') {
                playSfx('boink');
                speak("זה לא שייך לפה!");
                setBubbleText("זה לא שייך לפה!");
                
                // Red flash feedback on basket
                const originalBg = basketRefs.current[matchedBasket.id].style.backgroundColor;
                basketRefs.current[matchedBasket.id].style.backgroundColor = '#ffcdd2';
                setTimeout(() => {
                    if (basketRefs.current[matchedBasket.id]) {
                        basketRefs.current[matchedBasket.id].style.backgroundColor = originalBg;
                    }
                }, 500);
                return;
            }

            // 2. Correct match check
            if (matchedBasket.id === item.matchValue) {
                // Check level 2 capacity limit
                if (level === 2 && matchedBasket.currentCount >= matchedBasket.targetCount) {
                    playSfx('boink');
                    speak("הסל מלא");
                    setBubbleText("הסל הזה כבר מלא!");
                    return;
                }

                // Snap to basket center
                const spawnRect = spawningAreaRef.current.getBoundingClientRect();
                const basketRect = basketRefs.current[matchedBasket.id].getBoundingClientRect();
                
                // Add a small dispersion offset so items stack naturally
                const dispersion = 24;
                const offsetX = (Math.random() - 0.5) * dispersion;
                const offsetY = (Math.random() - 0.5) * dispersion;

                const targetX = (basketRect.left + basketRect.width / 2) - spawnRect.left + offsetX;
                const targetY = (basketRect.top + basketRect.height / 2) - spawnRect.top + offsetY;

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
                        return { ...i, sorted: true, x: targetX, y: targetY };
                    }
                    return i;
                });
                setItems(updatedItems);

                playSfx('ding', 800 + Math.random() * 400);

                // Determine voice praises
                const remaining = updatedItems.filter(i => !i.sorted && i.matchValue !== 'distractor').length;
                if (remaining <= 0) {
                    // Win game!
                    setIsWon(true);
                    playSfx('ding', 1200);
                    setTimeout(() => playSfx('ding', 1600), 200);
                    speak("כל הכבוד! הצלחת!");
                    setBubbleText("כל הכבוד! הצלחת!");
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
                // Wrong basket drop
                playSfx('boink');
                speak("אוי, נסה שוב");
                setBubbleText("אוי, נסה לגרור למקום אחר!");
            }
        } else {
            // Dropped outside any basket (in the top half)
            if (dropY < window.innerHeight / 2) {
                playSfx('boink');
                speak("אוי, נסה שוב");
            }
        }
    };

    return (
        <div className="view-container">
            {/* Header */}
            <div className="header-bar">
                <button className="btn-round" onClick={onBack}>
                    🏠
                </button>
                <h1 className="header-title">משחק מיון - שלב {level}</h1>
                <button className="btn-round" onClick={setupGame}>
                    🔄
                </button>
            </div>

            {/* Game Panel */}
            <div className="sorting-layout">
                {/* Spawning Area (top half) */}
                <div className="spawning-area" ref={spawningAreaRef}>
                    {items.map(item => (
                        <motion.div
                            key={item.id}
                            className={`draggable-item ${item.sorted ? 'success' : ''}`}
                            drag={!item.sorted && !isWon}
                            dragMomentum={false}
                            dragElastic={0.5}
                            onDragStart={handleDragStart}
                            onDragEnd={(e, info) => handleDragEnd(item.id, e, info)}
                            animate={{
                                x: item.x,
                                y: item.y,
                                scale: item.sorted ? 0.8 : 1
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            style={{
                                touchAction: 'none',
                                position: 'absolute'
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
                                borderColor: b.colorHex ? 'rgba(255,255,255,0.4)' : undefined
                            }}
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
            <DobiNarrator 
                bubbleText={bubbleText} 
                onNarratorClick={() => speak(bubbleText)} 
            />
        </div>
    );
}
