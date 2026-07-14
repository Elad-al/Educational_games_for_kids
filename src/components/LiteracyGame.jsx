import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hebrewLetters } from '../constants';
import { playSfx, speak, playLetterName, playLetterPhonetic, stopPhonetic, stopVoice } from '../hooks/useAudio';
import UnicornNarrator from './UnicornNarrator';

const stage3Associations = [
    { char: 'מ', label: 'מיטה', emoji: '🛏️' },
    { char: 'כ', label: 'כדור', emoji: '⚽' },
    { char: 'ב', label: 'בית', emoji: '🏠' },
    { char: 'ש', label: 'שמש', emoji: '☀️' },
    { char: 'פ', label: 'פרח', emoji: '🌸' },
    { char: 'ס', label: 'ספר', emoji: '📖' }
];

// We'll generate combinations dynamically now

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

// Returns start positions for N letters in the bottom area
function getLetterPositions(n) {
    const safeY = 'calc(100% - 100px)'; // Fixed distance from bottom to prevent clipping
    if (n === 1) return [{ startX: '50%', startY: safeY }];
    if (n === 2) return [{ startX: '33%', startY: safeY }, { startX: '67%', startY: safeY }];
    if (n === 3) return [
        { startX: '20%', startY: safeY },
        { startX: '50%', startY: safeY },
        { startX: '80%', startY: safeY }
    ];
    // n === 4
    return [
        { startX: '14%', startY: safeY },
        { startX: '38%', startY: safeY },
        { startX: '62%', startY: safeY },
        { startX: '86%', startY: safeY }
    ];
}

export default function LiteracyGame({ stage, onWin, onBack }) {
    const [currentLetter, setCurrentLetter] = useState(null);
    const [bubbleText, setBubbleText] = useState('');
    const [isWon, setIsWon] = useState(false);

    // ── Stage 1: Multi-level drag system ──────────────────────────────
    const [s1SubPhase, setS1SubPhase] = useState(1); // 1-4
    const [s1PhaseRounds, setS1PhaseRounds] = useState(0); // rounds completed in current sub-phase
    const [s1Targets, setS1Targets] = useState([]);   // silhouette targets
    const [s1Letters, setS1Letters] = useState([]);   // draggable letter options
    const s1TargetRefs = useRef({});
    const s1LetterRefs = useRef({});
    const s1LetterDragStart = useRef({}); // stores start pos per letter id

    // ── Stage 2 State ──────────────────────────────────────────────────
    const [options, setOptions] = useState([]);
    const [isCorrectTapped, setIsCorrectTapped] = useState(false);
    const [wiggleId, setWiggleId] = useState(null);
    const [correctCount, setCorrectCount] = useState(0); // for stages 2/3

    // ── Stage 3 State ──────────────────────────────────────────────────
    const [wandPos, setWandPos] = useState({ x: 0, y: 0, startX: '50%', startY: '85%' });
    const [magicObjects, setMagicObjects] = useState([]);
    const [targetObject, setTargetObject] = useState(null);
    const [magicDust, setMagicDust] = useState([]);
    const objectRefs = useRef({});
    const wandRef = useRef(null);
    const stage3StartPos = useRef({ x: 0, y: 0 });

    const containerRef = useRef(null);

    // ── Initialise ─────────────────────────────────────────────────────
    useEffect(() => {
        setCorrectCount(0);
        setS1SubPhase(1);
        setS1PhaseRounds(0);
        if (stage === 1) {
            setupStage1(1, true);
        } else {
            setupGame(true);
        }
        return () => { stopPhonetic(); stopVoice(); };
    }, [stage]);

    // ── Stage 1 Setup ─────────────────────────────────────────────────
    const setupStage1 = (subPhase, isReset = false) => {
        setIsWon(false);
        stopPhonetic();
        stopVoice();
        if (isReset) {
            setS1SubPhase(1);
            setS1PhaseRounds(0);
        }

        const numTargets = subPhase === 1 ? 1 : subPhase === 2 ? 2 : 3;
        const numDecoys  = subPhase === 2 ? 1 : subPhase === 4 ? 1 : 0;

        const targetLetters = shuffle(hebrewLetters).slice(0, numTargets);
        const available     = hebrewLetters.filter(l => !targetLetters.some(t => t.char === l.char));
        const decoys        = shuffle(available).slice(0, numDecoys);
        const allOptions    = shuffle([...targetLetters, ...decoys]);

        const positions = getLetterPositions(allOptions.length);
        const ts = Date.now();

        const targets = targetLetters.map((l, i) => ({
            id: `t${i}_${ts}`, char: l.char, name: l.name, isMatched: false
        }));

        const letters = allOptions.map((l, i) => ({
            id: `lo${i}_${ts}`, char: l.char, name: l.name,
            startX: positions[i].startX, startY: positions[i].startY,
            offsetX: 0, offsetY: 0, isMatched: false
        }));

        setS1Targets(targets);
        setS1Letters(letters);
        s1LetterDragStart.current = {};

        // Speak instruction
        if (numTargets === 1) {
            const instr = `גרור את האות ${targetLetters[0].char} אל הצללית שלה!`;
            setBubbleText(instr);
            speak(instr);
        } else {
            const instr = 'גרור כל אות אל הצללית המתאימה!';
            setBubbleText(instr);
            speak(instr);
        }
    };

    // ── Stage 1: Drag Handlers ────────────────────────────────────────
    const handleS1LetterDragStart = (letterId) => {
        const letter = s1Letters.find(l => l.id === letterId);
        if (!letter || letter.isMatched) return;

        playLetterPhonetic(letter.char);

        const el = s1LetterRefs.current[letterId];
        if (el && containerRef.current) {
            const rect  = el.getBoundingClientRect();
            const cRect = containerRef.current.getBoundingClientRect();
            s1LetterDragStart.current[letterId] = {
                x: rect.left + rect.width  / 2 - cRect.left,
                y: rect.top  + rect.height / 2 - cRect.top
            };
        }
    };

    const handleS1LetterDragEnd = (letterId, _event, info) => {
        stopPhonetic();
        const letter = s1Letters.find(l => l.id === letterId);
        if (!letter || letter.isMatched) return;

        const dropX = info.point.x;
        const dropY = info.point.y;

        // Find any unmatched target we dropped onto
        let hitTarget = null;
        for (const target of s1Targets) {
            if (target.isMatched) continue;
            const el = s1TargetRefs.current[target.id];
            if (!el) continue;
            const rect = el.getBoundingClientRect();
            const pad  = 50;
            if (dropX >= rect.left - pad && dropX <= rect.right  + pad &&
                dropY >= rect.top  - pad && dropY <= rect.bottom + pad) {
                hitTarget = target;
                break;
            }
        }

        if (!hitTarget) return; // missed, framer springs back to 0,0

        if (letter.char === hitTarget.char) {
            // ✅ Correct match!
            const targetEl    = s1TargetRefs.current[hitTarget.id];
            const cRect       = containerRef.current.getBoundingClientRect();
            const tRect       = targetEl.getBoundingClientRect();
            const snapX       = (tRect.left + tRect.width  / 2) - cRect.left;
            const snapY       = (tRect.top  + tRect.height / 2) - cRect.top;
            const startPos    = s1LetterDragStart.current[letterId] || { x: 0, y: 0 };
            const offsetX     = snapX - startPos.x;
            const offsetY     = snapY - startPos.y;

            const updTargets  = s1Targets.map(t => t.id === hitTarget.id ? { ...t, isMatched: true } : t);
            const updLetters  = s1Letters.map(l => l.id === letterId     ? { ...l, isMatched: true, offsetX, offsetY } : l);

            setS1Targets(updTargets);
            setS1Letters(updLetters);

            playSfx('ding', 1000);
            playLetterName(letter.char).then(() => {
                const allDone = updTargets.every(t => t.isMatched);
                if (allDone) {
                    // Round complete
                    const praises = ['יפה', 'מצוין', 'נהדר', 'כל הכבוד'];
                    const praise  = praises[Math.floor(Math.random() * praises.length)];
                    speak(praise);
                    setBubbleText(praise);

                    setS1PhaseRounds(prev => {
                        const newRounds = prev + 1;
                        if (newRounds >= 5) {
                            // Advance sub-phase
                            setS1SubPhase(prevPhase => {
                                const nextPhase = prevPhase + 1;
                                if (nextPhase > 4) {
                                    // All phases done → WIN
                                    setIsWon(true);
                                    setTimeout(() => onWin(1), 1800);
                                } else {
                                    // Announce new phase
                                    const phaseMsg = [
                                        '', '', 'יופי! עכשיו שתי אותיות בבת אחת!',
                                        'מדהים! עכשיו שלוש אותיות!',
                                        'וואו! עכשיו קשה יותר, שימי לב!'
                                    ][nextPhase];
                                    setTimeout(() => {
                                        speak(phaseMsg);
                                        setBubbleText(phaseMsg);
                                        setTimeout(() => setupStage1(nextPhase), 2000);
                                    }, 1500);
                                }
                                return nextPhase > 4 ? prevPhase : nextPhase;
                            });
                            return 0; // reset round counter
                        } else {
                            // Next round in same phase
                            setTimeout(() => setupStage1(s1SubPhase), 2200);
                            return newRounds;
                        }
                    });
                } else {
                    // More letters still to match in this round
                    const praise = ['יפה', 'מצוין', 'נהדר'][Math.floor(Math.random() * 3)];
                    speak(praise);
                    setBubbleText(praise);
                }
            });
        } else {
            // ❌ Wrong target
            playSfx('boink');
            speak('נסה שוב');
            setBubbleText('אוי, נסה לגרור אל הצללית הנכונה!');
        }
    };

    const handleS1TargetClick = (target) => {
        if (isWon || target.isMatched) return;
        playSfx('pop', 700);
        const instr = `גרור את האות ${target.char} אל הצללית שלה!`;
        setBubbleText(instr);
        speak(instr);
    };

    // ── Stage 2 & 3 Setup ─────────────────────────────────────────────
    const setupGame = (isFirstLoad = false) => {
        setIsWon(false);
        setIsCorrectTapped(false);
        stopPhonetic();
        stopVoice();
        if (isFirstLoad) setCorrectCount(0);

        const randomLetter = hebrewLetters[Math.floor(Math.random() * hebrewLetters.length)];
        setCurrentLetter(randomLetter);

        if (stage === 2) {
            const distractors = shuffle(hebrewLetters.filter(l => l.char !== randomLetter.char)).slice(0, 2);
            const list = shuffle([
                { ...randomLetter, isTarget: true },
                { ...distractors[0], isTarget: false },
                { ...distractors[1], isTarget: false }
            ]);
            setOptions(list);
            const instr = `איפה האות ${randomLetter.char}?`;
            setBubbleText(instr);
            speak(instr);
            setTimeout(() => playLetterName(randomLetter.char), 1500);

        } else if (stage === 3) {
            const assoc       = stage3Associations[Math.floor(Math.random() * stage3Associations.length)];
            const activeLetter = hebrewLetters.find(l => l.char === assoc.char);
            setCurrentLetter(activeLetter);
            setTargetObject(assoc);

            const otherAssocs = shuffle(stage3Associations.filter(a => a.char !== assoc.char)).slice(0, 2);
            const list = shuffle([
                { ...assoc, isTarget: true },
                { ...otherAssocs[0], isTarget: false },
                { ...otherAssocs[1], isTarget: false }
            ]);
            setMagicObjects(list);
            setMagicDust([]);
            setWandPos({ x: 0, y: 0, startX: '50%', startY: '85%' });
            stage3StartPos.current = { x: 0, y: 0 };

            const instr = `גרור את השרביט אל החפץ שמתחיל באות ${activeLetter.char}!`;
            setBubbleText(instr);
            speak(instr);
        }
    };

    // ── Stage 2 Handler ───────────────────────────────────────────────
    const handleStage2Tap = (opt) => {
        if (isCorrectTapped || isWon) return;
        if (opt.isTarget) {
            setIsCorrectTapped(true);
            const nextCount = correctCount + 1;
            setCorrectCount(nextCount);
            playSfx('ding', 1000);
            const praises = ['יפה', 'מצוין', 'נהדר', 'כל הכבוד'];
            const praise  = praises[Math.floor(Math.random() * praises.length)];
            speak(praise); setBubbleText(praise);
            if (nextCount >= 5) {
                setIsWon(true);
                setTimeout(() => onWin(2), 1500);
            } else {
                setTimeout(() => setupGame(false), 2200);
            }
        } else {
            setWiggleId(opt.char);
            playSfx('boink');
            
            // Fix: Add specific wrong letter feedback
            const feedback = `זאת האות ${opt.char}, נסה שוב!`;
            speak(feedback);
            setBubbleText(feedback);
            
            setTimeout(() => setWiggleId(null), 500);
        }
    };

    // ── Stage 3 Handlers ──────────────────────────────────────────────
    const handleStage3DragStart = () => {
        playSfx('pop', 450);
        if (wandRef.current && containerRef.current) {
            const rect  = wandRef.current.getBoundingClientRect();
            const cRect = containerRef.current.getBoundingClientRect();
            stage3StartPos.current = {
                x: rect.left + rect.width  / 2 - cRect.left,
                y: rect.top  + rect.height / 2 - cRect.top
            };
        }
    };

    const handleWandDrag = (_event, info) => {
        if (Math.random() > 0.4) return;
        const cRect = containerRef.current.getBoundingClientRect();
        const x = info.point.x - cRect.left;
        const y = info.point.y - cRect.top;
        setMagicDust(prev => [...prev.slice(-20), { id: Date.now() + Math.random(), x: x - 6, y: y - 6 }]);
    };

    const handleStage3DragEnd = (_event, info) => {
        const dropX = info.point.x;
        const dropY = info.point.y;

        let hitObject = null;
        for (const obj of magicObjects) {
            const el = objectRefs.current[obj.label];
            if (el) {
                const rect = el.getBoundingClientRect();
                const pad  = 40;
                if (dropX >= rect.left - pad && dropX <= rect.right  + pad &&
                    dropY >= rect.top  - pad && dropY <= rect.bottom + pad) {
                    hitObject = obj; break;
                }
            }
        }

        if (hitObject) {
            if (hitObject.isTarget) {
                playSfx('ding', 1000);
                const cRect   = containerRef.current.getBoundingClientRect();
                const objRect = objectRefs.current[hitObject.label].getBoundingClientRect();
                const snapX   = (objRect.left + objRect.width / 2) - cRect.left;
                const snapY   = objRect.top - cRect.top - 20;
                const dx = snapX - stage3StartPos.current.x;
                const dy = snapY - stage3StartPos.current.y;
                setWandPos(prev => ({ ...prev, x: dx, y: dy }));

                const nextCount = correctCount + 1;
                setCorrectCount(nextCount);
                const praises = ['יפה', 'מצוין', 'נהדר', 'כל הכבוד'];
                const praise  = praises[Math.floor(Math.random() * praises.length)];
                speak(praise); setBubbleText(praise);
                if (nextCount >= 5) {
                    setIsWon(true);
                    setTimeout(() => onWin(3), 1500);
                } else {
                    setTimeout(() => setupGame(false), 2500);
                }
            } else {
                setWiggleId(hitObject.label);
                playSfx('boink');
                
                const feedback = `זה ${hitObject.label}, זה מתחיל באות ${hitObject.char}. נסה שוב!`;
                speak(feedback);
                setBubbleText(feedback);
                
                setWandPos(prev => ({ ...prev, x: 0, y: 0 }));
                setTimeout(() => setWiggleId(null), 500);
            }
        } else {
            setWandPos(prev => ({ ...prev, x: 0, y: 0 }));
        }
    };

    const handleObjectClick = (obj) => {
        if (isWon) return;
        playSfx('pop', 700);
        const phrase = `זה ${obj.label}, אם זה מתחיל באות ${currentLetter.char} הזז את השרביט לכאן`;
        setBubbleText(phrase);
        speak(phrase);
    };

    // ── Progress bar ──────────────────────────────────────────────────
    const renderProgressTracker = () => {
        if (stage === 1) {
            const phaseNames = ['', 'שלב א', 'שלב ב', 'שלב ג', 'שלב ד'];
            const stars = '⭐'.repeat(s1PhaseRounds) + '☆'.repeat(5 - Math.min(s1PhaseRounds, 5));
            return (
                <div className="lit-progress-bar">
                    {phaseNames[s1SubPhase]}: <span style={{ letterSpacing: '4px', fontSize: '1.4rem' }}>{stars}</span>
                </div>
            );
        }
        let visual = '';
        for (let i = 0; i < 5; i++) visual += i < correctCount ? '⭐' : '☆';
        return (
            <div className="lit-progress-bar">
                התקדמות: <span style={{ letterSpacing: '4px', fontSize: '1.8rem' }}>{visual}</span>
            </div>
        );
    };

    return (
        <div className="view-container" ref={containerRef} id="literacy-stage-container">
            <div className="game-screen" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>

            {/* Header */}
            <div className="header-bar">
                <button className="cartoon-button btn-yellow" onClick={onBack}>🏠 חזור</button>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h1 className="cartoon-text-title">לימוד אותיות - שלב {stage}</h1>
                    {renderProgressTracker()}
                </div>
                <button className="cartoon-button btn-red" onClick={() => { if (stage === 1) { setS1SubPhase(1); setS1PhaseRounds(0); setupStage1(1, true); } else setupGame(true); }}>🔄 שוב</button>
            </div>

            {/* Stage Layout */}
            <div className="literacy-layout">

                {/* ── STAGE 1: Multi-level drag ── */}
                {stage === 1 && (
                    <>
                        {/* Target silhouettes */}
                        <div className="s1-targets-row">
                            {s1Targets.map(target => (
                                <div
                                    key={target.id}
                                    ref={el => s1TargetRefs.current[target.id] = el}
                                    className={`silhouette-container ${target.isMatched ? 'silhouette-matched' : ''}`}
                                    onClick={() => handleS1TargetClick(target)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {target.char}
                                    {target.isMatched && (
                                        <div className="silhouette-check">✓</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Draggable letter options – absolutely positioned in bottom strip */}
                        {s1Letters.map(letter => (
                            <motion.div
                                key={letter.id}
                                ref={el => s1LetterRefs.current[letter.id] = el}
                                className={`draggable-letter ${letter.isMatched ? 'success' : ''}`}
                                drag={!letter.isMatched}
                                dragMomentum={false}
                                dragElastic={0.35}
                                onDragStart={() => handleS1LetterDragStart(letter.id)}
                                onDragEnd={(e, info) => handleS1LetterDragEnd(letter.id, e, info)}
                                animate={{
                                    x: letter.isMatched ? letter.offsetX : 0,
                                    y: letter.isMatched ? letter.offsetY : 0
                                }}
                                style={{
                                    touchAction: 'none',
                                    position: 'absolute',
                                    left: letter.startX,
                                    top: letter.startY,
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: letter.isMatched ? 50 : 100
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            >
                                {letter.char}
                            </motion.div>
                        ))}
                    </>
                )}

                {/* ── STAGE 2: Seek & Find ── */}
                {stage === 2 && currentLetter && (
                    <div className="seek-container">
                        {options.map((opt, index) => (
                            <div
                                key={index}
                                className={`seek-item ${isCorrectTapped && opt.isTarget ? 'center-stage' : ''} ${wiggleId === opt.char ? 'wiggle' : ''}`}
                                onClick={() => handleStage2Tap(opt)}
                            >
                                {opt.char}
                            </div>
                        ))}
                    </div>
                )}

                {/* ── STAGE 3: Magic Wand & Objects ── */}
                {stage === 3 && currentLetter && (
                    <div className="magic-stage">
                        <div className="magic-objects">
                            {magicObjects.map((obj, index) => (
                                <div
                                    key={index}
                                    ref={el => objectRefs.current[obj.label] = el}
                                    className={`magic-object ${isWon && obj.isTarget ? 'success-bounce' : ''} ${wiggleId === obj.label ? 'wiggle' : ''}`}
                                    onClick={() => handleObjectClick(obj)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="object-emoji">{obj.emoji}</div>
                                </div>
                            ))}
                        </div>

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
                                animate={isWon ? { x: wandPos.x, y: wandPos.y } : { x: 0, y: 0 }}
                                style={{
                                    touchAction: 'none',
                                    position: 'absolute',
                                    left: wandPos.startX,
                                    top: wandPos.startY,
                                    transform: 'translate(-50%, -50%)',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    background: 'linear-gradient(135deg, #FFD700, #FFB300)',
                                    borderRadius: '50%',
                                    width: '100px', height: '100px',
                                    boxShadow: '0 8px 0 #FF8F00, 0 10px 20px rgba(0,0,0,0.3), inset 0 5px 10px rgba(255,255,255,0.8)',
                                    border: '4px solid #FFF',
                                    color: '#FFF', fontSize: '3rem', fontWeight: 'bold',
                                    textShadow: '2px 2px 0px #FF6F00'
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            >
                                <div style={{ position: 'absolute', top: '-25px', right: '-15px', fontSize: '3rem', transform: 'rotate(15deg)' }}>🪄</div>
                                <span>{currentLetter.char}</span>
                            </motion.div>
                        </div>
                    </div>
                )}
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
