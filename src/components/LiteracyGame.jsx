import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hebrewLetters } from '../constants';
import { playSfx, speak, playLetterName, playLetterPhonetic, stopPhonetic, stopVoice } from '../hooks/useAudio';
import DobiNarrator from './DobiNarrator';

// Custom stage 3 associations
const stage3Associations = [
    { char: 'מ', label: 'מיטה', emoji: '🛏️' },
    { char: 'כ', label: 'כדור', emoji: '⚽' },
    { char: 'ב', label: 'בית', emoji: '🏠' },
    { char: 'ש', label: 'שמש', emoji: '☀️' },
    { char: 'פ', label: 'פרח', emoji: '🌸' },
    { char: 'ס', label: 'ספר', emoji: '📖' }
];

export default function LiteracyGame({ stage, onWin, onBack }) {
    const [currentLetter, setCurrentLetter] = useState(null);
    const [bubbleText, setBubbleText] = useState('');
    const [isWon, setIsWon] = useState(false);
    
    // Stage 1 State
    const [letterPos, setLetterPos] = useState({ x: 0, y: 0, startX: 0, startY: 0 });
    const silhouetteRef = useRef(null);
    const letterRef = useRef(null);

    // Stage 2 State
    const [options, setOptions] = useState([]);
    const [isCorrectTapped, setIsCorrectTapped] = useState(false);
    const [wiggleId, setWiggleId] = useState(null);

    // Stage 3 State
    const [wandPos, setWandPos] = useState({ x: 0, y: 0, startX: 0, startY: 0 });
    const [magicObjects, setMagicObjects] = useState([]);
    const [targetObject, setTargetObject] = useState(null);
    const [magicDust, setMagicDust] = useState([]);
    const objectRefs = useRef({});
    const wandRef = useRef(null);

    useEffect(() => {
        setupGame();
        return () => {
            stopPhonetic();
            stopVoice();
        };
    }, [stage]);

    const setupGame = () => {
        setIsWon(false);
        stopPhonetic();
        stopVoice();
        
        const randomLetter = hebrewLetters[Math.floor(Math.random() * hebrewLetters.length)];
        setCurrentLetter(randomLetter);

        if (stage === 1) {
            // Setup position for Letter Drag
            // Randomly position in the bottom half of screen
            setTimeout(() => {
                const startX = Math.floor(window.innerWidth * (0.2 + Math.random() * 0.6));
                const startY = Math.floor(window.innerHeight * (0.65 + Math.random() * 0.15));
                setLetterPos({ x: startX, y: startY, startX, startY });
            }, 100);

            const instr = `גרור את האות ${randomLetter.char} אל הצללית שלה!`;
            setBubbleText(instr);
            speak(instr);
        } else if (stage === 2) {
            setIsCorrectTapped(false);
            
            // Spawn 3 options: target + 2 distractors
            const distractors = [...hebrewLetters]
                .filter(l => l.char !== randomLetter.char)
                .sort(() => 0.5 - Math.random())
                .slice(0, 2);
            
            const list = [
                { ...randomLetter, isTarget: true },
                { ...distractors[0], isTarget: false },
                { ...distractors[1], isTarget: false }
            ].sort(() => 0.5 - Math.random());

            setOptions(list);

            const instr = `איפה האות ${randomLetter.char}?`;
            setBubbleText(instr);
            speak(instr);
            // Play target letter name voiceover
            setTimeout(() => {
                playLetterName(randomLetter.char);
            }, 1500);
        } else if (stage === 3) {
            // Pick a random association for target letter
            const assoc = stage3Associations[Math.floor(Math.random() * stage3Associations.length)];
            const activeLetter = hebrewLetters.find(l => l.char === assoc.char);
            setCurrentLetter(activeLetter);
            setTargetObject(assoc);

            // Spawns 3 objects: target object + 2 distractors
            const otherAssocs = stage3Associations
                .filter(a => a.char !== assoc.char)
                .sort(() => 0.5 - Math.random())
                .slice(0, 2);

            const list = [
                { ...assoc, isTarget: true },
                { ...otherAssocs[0], isTarget: false },
                { ...otherAssocs[1], isTarget: false }
            ].sort(() => 0.5 - Math.random());

            setMagicObjects(list);
            setMagicDust([]);

            setTimeout(() => {
                const startX = window.innerWidth / 2;
                const startY = window.innerHeight * 0.8;
                setWandPos({ x: startX, y: startY, startX, startY });
            }, 100);

            const instr = `גרור את השרביט אל החפץ שמתחיל באות ${activeLetter.char}!`;
            setBubbleText(instr);
            speak(instr);
        }
    };

    // Stage 1 handlers
    const handleDragStart = () => {
        if (stage === 1 && currentLetter) {
            playLetterPhonetic(currentLetter.char);
        } else {
            playSfx('pop', 450);
        }
    };

    const handleStage1DragEnd = (event, info) => {
        stopPhonetic();
        const dropX = info.point.x;
        const dropY = info.point.y;

        const targetRect = silhouetteRef.current.getBoundingClientRect();
        const hitPadding = 80;

        if (dropX > targetRect.left - hitPadding && dropX < targetRect.right + hitPadding &&
            dropY > targetRect.top - hitPadding && dropY < targetRect.bottom + hitPadding) {
            
            // Correct drop
            const stageRect = document.getElementById('literacy-stage-container').getBoundingClientRect();
            const snapX = (targetRect.left + targetRect.width / 2) - stageRect.left;
            const snapY = (targetRect.top + targetRect.height / 2) - stageRect.top;

            setLetterPos({
                x: snapX,
                y: snapY,
                startX: snapX,
                startY: snapY
            });

            setIsWon(true);

            // First speak letter name, then praise
            playLetterName(currentLetter.char).then(() => {
                playSfx('ding', 1000);
                const praises = ['יפה', 'מצוין', 'נהדר', 'כל הכבוד'];
                const praise = praises[Math.floor(Math.random() * praises.length)];
                speak(praise);
                setBubbleText(praise);
                onWin(1);

                setTimeout(() => {
                    setupGame();
                }, 2000);
            });
        } else {
            // Wrong drop
            playSfx('boink');
            speak('נסה שוב');
            setBubbleText('נסה לגרור אל הצללית!');
        }
    };

    // Stage 2 handler
    const handleStage2Tap = (opt) => {
        if (isCorrectTapped || isWon) return;

        if (opt.isTarget) {
            setIsCorrectTapped(true);
            setIsWon(true);
            playSfx('ding', 1000);
            const praises = ['יפה', 'מצוין', 'נהדר', 'כל הכבוד'];
            const praise = praises[Math.floor(Math.random() * praises.length)];
            speak(praise);
            setBubbleText(praise);
            onWin(2);

            setTimeout(() => {
                setupGame();
            }, 2500);
        } else {
            setWiggleId(opt.char);
            playSfx('boink');
            speak('נסה שוב');
            setBubbleText('נסה לחפש אות אחרת!');
            setTimeout(() => setWiggleId(null), 500);
        }
    };

    // Stage 3 handlers
    const handleWandDrag = (event, info) => {
        // Spawn magic dust particles at pointer location relative to stage
        if (Math.random() > 0.4) return;
        const stageRect = document.getElementById('literacy-stage-container').getBoundingClientRect();
        const x = info.point.x - stageRect.left;
        const y = info.point.y - stageRect.top;

        const newDust = {
            id: Date.now() + Math.random(),
            x: x - 6,
            y: y - 6
        };
        setMagicDust(prev => [...prev.slice(-20), newDust]); // Keep max 20 particles
    };

    const handleStage3DragEnd = (event, info) => {
        const dropX = info.point.x;
        const dropY = info.point.y;

        let hitObject = null;
        for (let obj of magicObjects) {
            const el = objectRefs.current[obj.label];
            if (el) {
                const rect = el.getBoundingClientRect();
                const hitPadding = 40;
                if (dropX > rect.left - hitPadding && dropX < rect.right + hitPadding &&
                    dropY > rect.top - hitPadding && dropY < rect.bottom + hitPadding) {
                    hitObject = obj;
                    break;
                }
            }
        }

        if (hitObject) {
            if (hitObject.isTarget) {
                // Correct match
                setIsWon(true);
                playSfx('ding', 1000);
                
                // Snap wand to hover slightly above target object
                const stageRect = document.getElementById('literacy-stage-container').getBoundingClientRect();
                const objRect = objectRefs.current[hitObject.label].getBoundingClientRect();
                const snapX = (objRect.left + objRect.width / 2) - stageRect.left;
                const snapY = objRect.top - stageRect.top - 20;

                setWandPos({
                    x: snapX,
                    y: snapY,
                    startX: snapX,
                    startY: snapY
                });

                const praises = ['יפה', 'מצוין', 'נהדר', 'כל הכבוד'];
                const praise = praises[Math.floor(Math.random() * praises.length)];
                speak(praise);
                setBubbleText(praise);
                onWin(3);

                setTimeout(() => {
                    setupGame();
                }, 3000);
            } else {
                // Wrong object
                setWiggleId(hitObject.label);
                playSfx('boink');
                speak('נסה שוב');
                setBubbleText('אוי, החפץ הזה מתחיל באות אחרת!');
                
                // Bounce wand back
                setWandPos(prev => ({
                    ...prev,
                    x: prev.startX,
                    y: prev.startY
                }));

                setTimeout(() => setWiggleId(null), 500);
            }
        } else {
            // Drop in empty area, bounce back
            setWandPos(prev => ({
                ...prev,
                x: prev.startX,
                y: prev.startY
            }));
        }
    };

    return (
        <div className="view-container" id="literacy-stage-container">
            {/* Header */}
            <div className="header-bar">
                <button className="btn-round" onClick={onBack}>
                    🏠
                </button>
                <h1 className="header-title">לימוד אותיות - שלב {stage}</h1>
                <button className="btn-round" onClick={setupGame}>
                    🔄
                </button>
            </div>

            {/* Stage Layout */}
            <div className="literacy-layout" style={{ width: '100%' }}>
                
                {/* STAGE 1: Drag letter to silhouette */}
                {stage === 1 && currentLetter && (
                    <>
                        <div className="silhouette-container" ref={silhouetteRef}>
                            {currentLetter.char}
                        </div>
                        
                        <motion.div
                            key={currentLetter.char}
                            ref={letterRef}
                            className={`draggable-letter ${isWon ? 'success' : ''}`}
                            drag={!isWon}
                            dragMomentum={false}
                            dragElastic={0.4}
                            onDragStart={handleDragStart}
                            onDragEnd={handleStage1DragEnd}
                            animate={{
                                x: letterPos.x,
                                y: letterPos.y,
                            }}
                            style={{
                                touchAction: 'none',
                                position: 'absolute',
                                transform: 'translate(-50%, -50%)',
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            {currentLetter.char}
                        </motion.div>
                    </>
                )}

                {/* STAGE 2: Seek & Find */}
                {stage === 2 && currentLetter && (
                    <div className="seek-container">
                        {options.map((opt, index) => (
                            <div
                                key={index}
                                className={`seek-item 
                                    ${isCorrectTapped && opt.isTarget ? 'center-stage' : ''} 
                                    ${wiggleId === opt.char ? 'wiggle' : ''}
                                `}
                                onClick={() => handleStage2Tap(opt)}
                            >
                                {opt.char}
                            </div>
                        ))}
                    </div>
                )}

                {/* STAGE 3: Magic Wand & Objects */}
                {stage === 3 && currentLetter && (
                    <div className="magic-stage">
                        {/* Magic Objects list (top) */}
                        <div className="magic-objects">
                            {magicObjects.map((obj, index) => (
                                <div
                                    key={index}
                                    ref={el => objectRefs.current[obj.label] = el}
                                    className={`magic-object 
                                        ${isWon && obj.isTarget ? 'success-bounce' : ''} 
                                        ${wiggleId === obj.label ? 'wiggle' : ''}
                                    `}
                                >
                                    <div className="object-emoji">{obj.emoji}</div>
                                    <div className="object-label">{obj.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Wand spawning container (bottom) */}
                        <div className="wand-spawner">
                            <motion.div
                                key={currentLetter.char}
                                ref={wandRef}
                                className="magic-wand-letter"
                                drag={!isWon}
                                dragMomentum={false}
                                dragElastic={0.4}
                                onDragStart={handleDragStart}
                                onDrag={handleWandDrag}
                                onDragEnd={handleStage3DragEnd}
                                animate={{
                                    x: wandPos.x,
                                    y: wandPos.y,
                                }}
                                style={{
                                    touchAction: 'none',
                                    position: 'absolute',
                                    transform: 'translate(-50%, -50%)',
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            >
                                {currentLetter.char}
                            </motion.div>
                        </div>

                        {/* Particle dust trail */}
                        {magicDust.map(d => (
                            <div
                                key={d.id}
                                className="magic-dust-particle"
                                style={{
                                    left: d.x,
                                    top: d.y
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Guide Narrator */}
            <DobiNarrator 
                bubbleText={bubbleText} 
                onNarratorClick={() => speak(bubbleText)} 
            />
        </div>
    );
}
