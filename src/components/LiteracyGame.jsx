import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hebrewLetters } from '../constants';
import { playSfx, speak, playLetterName, playLetterPhonetic, stopPhonetic, stopVoice } from '../hooks/useAudio';
import DobiNarrator from './DobiNarrator';

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
    const [correctCount, setCorrectCount] = useState(0); // Track progress (0/5)
    
    // Stage 1 State
    const [letterPos, setLetterPos] = useState({ x: 0, y: 0, startX: '50%', startY: '75%' });
    const silhouetteRef = useRef(null);
    const letterRef = useRef(null);
    const stage1StartPos = useRef({ x: 0, y: 0 });

    // Stage 2 State
    const [options, setOptions] = useState([]);
    const [isCorrectTapped, setIsCorrectTapped] = useState(false);
    const [wiggleId, setWiggleId] = useState(null);

    // Stage 3 State
    const [wandPos, setWandPos] = useState({ x: 0, y: 0, startX: '50%', startY: '85%' });
    const [magicObjects, setMagicObjects] = useState([]);
    const [targetObject, setTargetObject] = useState(null);
    const [magicDust, setMagicDust] = useState([]);
    const objectRefs = useRef({});
    const wandRef = useRef(null);
    const stage3StartPos = useRef({ x: 0, y: 0 });

    const containerRef = useRef(null);

    // Initialize game and reset count when stage changes
    useEffect(() => {
        setCorrectCount(0);
        setupGame(true);
        return () => {
            stopPhonetic();
            stopVoice();
        };
    }, [stage]);

    // setupGame takes a flag to know if it should reset progress
    const setupGame = (isFirstLoad = false) => {
        setIsWon(false);
        setIsCorrectTapped(false);
        stopPhonetic();
        stopVoice();

        if (isFirstLoad) {
            setCorrectCount(0);
        }
        
        const randomLetter = hebrewLetters[Math.floor(Math.random() * hebrewLetters.length)];
        setCurrentLetter(randomLetter);

        if (stage === 1) {
            const startX = Math.floor(20 + Math.random() * 60) + '%';
            const startY = Math.floor(70 + Math.random() * 15) + '%';
            setLetterPos({ x: 0, y: 0, startX, startY });
            stage1StartPos.current = { x: 0, y: 0 };

            const instr = `גרור את האות ${randomLetter.char} אל הצללית שלה!`;
            setBubbleText(instr);
            speak(instr);
        } else if (stage === 2) {
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
            setTimeout(() => {
                playLetterName(randomLetter.char);
            }, 1500);
        } else if (stage === 3) {
            const assoc = stage3Associations[Math.floor(Math.random() * stage3Associations.length)];
            const activeLetter = hebrewLetters.find(l => l.char === assoc.char);
            setCurrentLetter(activeLetter);
            setTargetObject(assoc);

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

            setWandPos({ x: 0, y: 0, startX: '50%', startY: '85%' });
            stage3StartPos.current = { x: 0, y: 0 };

            const instr = `גרור את השרביט אל החפץ שמתחיל באות ${activeLetter.char}!`;
            setBubbleText(instr);
            speak(instr);
        }
    };

    // Stage 1 Drag Start
    const handleStage1DragStart = () => {
        if (currentLetter) {
            playLetterPhonetic(currentLetter.char);
        }

        if (letterRef.current && containerRef.current) {
            const rect = letterRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            stage1StartPos.current = {
                x: rect.left + rect.width / 2 - containerRect.left,
                y: rect.top + rect.height / 2 - containerRect.top
            };
        }
    };

    // Stage 1 Drag End
    const handleStage1DragEnd = (event, info) => {
        stopPhonetic();
        const dropX = info.point.x;
        const dropY = info.point.y;

        const targetRect = silhouetteRef.current.getBoundingClientRect();
        const hitPadding = 80;

        if (dropX > targetRect.left - hitPadding && dropX < targetRect.right + hitPadding &&
            dropY > targetRect.top - hitPadding && dropY < targetRect.bottom + hitPadding) {
            
            // Success snap
            const containerRect = containerRef.current.getBoundingClientRect();
            const snapX = (targetRect.left + targetRect.width / 2) - containerRect.left;
            const snapY = (targetRect.top + targetRect.height / 2) - containerRect.top;

            const dx = snapX - stage1StartPos.current.x;
            const dy = snapY - stage1StartPos.current.y;

            setLetterPos(prev => ({
                ...prev,
                x: dx,
                y: dy
            }));

            const nextCount = correctCount + 1;
            setCorrectCount(nextCount);

            playLetterName(currentLetter.char).then(() => {
                playSfx('ding', 1000);
                const praises = ['יפה', 'מצוין', 'נהדר', 'כל הכבוד'];
                const praise = praises[Math.floor(Math.random() * praises.length)];
                speak(praise);
                setBubbleText(praise);

                if (nextCount >= 5) {
                    setIsWon(true);
                    setTimeout(() => {
                        onWin(1);
                    }, 1500);
                } else {
                    setTimeout(() => {
                        setupGame(false);
                    }, 2200);
                }
            });
        } else {
            playSfx('boink');
            speak('נסה שוב');
            setBubbleText('אוי, נסה לגרור אל צללית האות!');
        }
    };

    const handleSilhouetteClick = () => {
        if (isWon) return;
        playSfx('pop', 700);
        const msg = `גרור לכאן את האות ${currentLetter.char}!`;
        setBubbleText(msg);
        speak(msg);
    };

    // Stage 2 Click Handler
    const handleStage2Tap = (opt) => {
        if (isCorrectTapped || isWon) return;

        if (opt.isTarget) {
            setIsCorrectTapped(true);
            const nextCount = correctCount + 1;
            setCorrectCount(nextCount);

            playSfx('ding', 1000);
            const praises = ['יפה', 'מצוין', 'נהדר', 'כל הכבוד'];
            const praise = praises[Math.floor(Math.random() * praises.length)];
            speak(praise);
            setBubbleText(praise);

            if (nextCount >= 5) {
                setIsWon(true);
                setTimeout(() => {
                    onWin(2);
                }, 1500);
            } else {
                setTimeout(() => {
                    setupGame(false);
                }, 2200);
            }
        } else {
            setWiggleId(opt.char);
            playSfx('boink');
            speak('נסה שוב');
            setBubbleText('נסה לחפש אות אחרת!');
            setTimeout(() => setWiggleId(null), 500);
        }
    };

    // Stage 3 Drag Start
    const handleStage3DragStart = () => {
        playSfx('pop', 450);

        if (wandRef.current && containerRef.current) {
            const rect = wandRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            stage3StartPos.current = {
                x: rect.left + rect.width / 2 - containerRect.left,
                y: rect.top + rect.height / 2 - containerRect.top
            };
        }
    };

    const handleWandDrag = (event, info) => {
        if (Math.random() > 0.4) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const x = info.point.x - containerRect.left;
        const y = info.point.y - containerRect.top;

        const newDust = {
            id: Date.now() + Math.random(),
            x: x - 6,
            y: y - 6
        };
        setMagicDust(prev => [...prev.slice(-20), newDust]);
    };

    // Stage 3 Drag End
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
                playSfx('ding', 1000);
                
                // Snap coordinates
                const containerRect = containerRef.current.getBoundingClientRect();
                const objRect = objectRefs.current[hitObject.label].getBoundingClientRect();
                
                const snapX = (objRect.left + objRect.width / 2) - containerRect.left;
                const snapY = objRect.top - containerRect.top - 20;

                const dx = snapX - stage3StartPos.current.x;
                const dy = snapY - stage3StartPos.current.y;

                setWandPos(prev => ({
                    ...prev,
                    x: dx,
                    y: dy
                }));

                const nextCount = correctCount + 1;
                setCorrectCount(nextCount);

                const praises = ['יפה', 'מצוין', 'נהדר', 'כל הכבוד'];
                const praise = praises[Math.floor(Math.random() * praises.length)];
                speak(praise);
                setBubbleText(praise);

                if (nextCount >= 5) {
                    setIsWon(true);
                    setTimeout(() => {
                        onWin(3);
                    }, 1500);
                } else {
                    setTimeout(() => {
                        setupGame(false);
                    }, 2500);
                }
            } else {
                setWiggleId(hitObject.label);
                playSfx('boink');
                speak('נסה שוב');
                setBubbleText('אוי, החפץ הזה מתחיל באות אחרת!');
                
                setWandPos(prev => ({
                    ...prev,
                    x: 0,
                    y: 0
                }));

                setTimeout(() => setWiggleId(null), 500);
            }
        } else {
            setWandPos(prev => ({
                ...prev,
                x: 0,
                y: 0
            }));
        }
    };

    const handleObjectClick = (obj) => {
        if (isWon) return;
        playSfx('pop', 700);

        const msg = `זה ${obj.label}. גרור לכאן את האות ${currentLetter.char} אם היא מתאימה!`;
        setBubbleText(msg);
        speak(msg);
    };

    // Generate progress dots visual helper (e.g. 🦊🦊🦊🐨🐨)
    const renderProgressTracker = () => {
        const total = 5;
        let visual = '';
        for (let i = 0; i < total; i++) {
            visual += i < correctCount ? '⭐' : '☆';
        }
        return (
            <div className="lit-progress-bar">
                התקדמות: <span style={{ letterSpacing: '4px', fontSize: '1.8rem' }}>{visual}</span>
            </div>
        );
    };

    return (
        <div className="view-container" ref={containerRef} id="literacy-stage-container">
            {/* Header */}
            <div className="header-bar">
                <button className="btn-round" onClick={onBack}>
                    🏠
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h1 className="header-title">לימוד אותיות - שלב {stage}</h1>
                    {renderProgressTracker()}
                </div>
                <button className="btn-round" onClick={() => setupGame(true)}>
                    🔄
                </button>
            </div>

            {/* Stage Layout */}
            <div className="literacy-layout" style={{ width: '100%' }}>
                
                {/* STAGE 1: Drag letter to silhouette */}
                {stage === 1 && currentLetter && (
                    <>
                        <div 
                            className="silhouette-container" 
                            ref={silhouetteRef}
                            onClick={handleSilhouetteClick}
                            style={{ cursor: 'pointer' }}
                        >
                            {currentLetter.char}
                        </div>
                        
                        <motion.div
                            key={currentLetter.char}
                            ref={letterRef}
                            className={`draggable-letter ${isWon ? 'success' : ''}`}
                            drag={!isWon}
                            dragMomentum={false}
                            dragElastic={0.4}
                            onDragStart={handleStage1DragStart}
                            onDragEnd={handleStage1DragEnd}
                            animate={isWon ? {
                                x: letterPos.x,
                                y: letterPos.y,
                            } : {
                                x: 0,
                                y: 0
                            }}
                            style={{
                                touchAction: 'none',
                                position: 'absolute',
                                left: letterPos.startX,
                                top: letterPos.startY,
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
                                    onClick={() => handleObjectClick(obj)}
                                    style={{ cursor: 'pointer' }}
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
                                onDragStart={handleStage3DragStart}
                                onDrag={handleWandDrag}
                                onDragEnd={handleStage3DragEnd}
                                animate={isWon ? {
                                    x: wandPos.x,
                                    y: wandPos.y,
                                } : {
                                    x: 0,
                                    y: 0
                                }}
                                style={{
                                    touchAction: 'none',
                                    position: 'absolute',
                                    left: wandPos.startX,
                                    top: wandPos.startY,
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
