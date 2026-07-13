document.addEventListener('DOMContentLoaded', () => {
    // Basic View Management
    const viewMenu = document.getElementById('main-menu');
    const viewDifficultyMenu = document.getElementById('difficulty-menu');
    const viewGameSorting = document.getElementById('game-sorting');
    const viewGameLiteracy = document.getElementById('game-literacy');
    const viewLiteracyMenu = document.getElementById('literacy-menu');
    window.viewDifficultyMenu = viewDifficultyMenu;
    window.viewMenu = viewMenu;
    window.viewLiteracyMenu = viewLiteracyMenu;
    window.viewGameLiteracy = viewGameLiteracy;
    
    let currentDifficulty = 1; // 1 = Colors, 2 = Colors & Numbers, 3 = Shapes, 4 = Categories, 5 = Literacy

    document.getElementById('btn-start-sorting').addEventListener('click', () => {
        // 1. Attempt Fullscreen on mobile
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.log("Fullscreen API blocked or unsupported:", err);
            });
        }

        // 2. Initialize Audio Context safely inside user gesture
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        try {
            // 3. Pre-load Hebrew TTS audio within the user gesture (critical for Android autoplay)
            _unlockAndPreloadTTS();
        } catch(e) { console.log("TTS setup error", e); }
        
        switchView(viewDifficultyMenu);
        playSound('pop', 600);
    });

    document.getElementById('btn-start-literacy').addEventListener('click', () => {
        // 1. Attempt Fullscreen on mobile
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.log("Fullscreen API blocked or unsupported:", err);
            });
        }

        // 2. Initialize Audio Context safely inside user gesture
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        try {
            // 3. Pre-load Hebrew TTS audio within the user gesture (critical for Android autoplay)
            _unlockAndPreloadTTS();
        } catch(e) { console.log("TTS setup error", e); }
        
        switchView(viewLiteracyMenu);
        playSound('pop', 600);
    });
    
    // ------- Level Map Logic -------
    // Progress stored as: { levelN: { wins: number, bestMistakes: number } }
    function _getProgress() {
        try { return JSON.parse(localStorage.getItem('sortingProgress') || '{}'); }
        catch(e) { return {}; }
    }
    function _saveProgress(data) {
        try { localStorage.setItem('sortingProgress', JSON.stringify(data)); }
        catch(e) {}
    }

    function _starsForLevel(level) {
        const p = _getProgress()[level];
        if (!p) return '';
        if (p.wins >= 3) return '⭐⭐⭐';
        if (p.wins >= 2) return '⭐⭐';
        return '⭐';
    }

    function _refreshMap() {
        [1,2,3,4].forEach(level => {
            const starsEl = document.getElementById(`stars-${level}`);
            if (starsEl) starsEl.textContent = _starsForLevel(level);
        });
    }

    function _recordLevelWin(level) {
        const p = _getProgress();
        if (!p[level]) p[level] = { wins: 0 };
        p[level].wins++;
        _saveProgress(p);
        _refreshMap();
    }
    window._recordLevelWin = _recordLevelWin;
    window._refreshMap = _refreshMap;

    // Wire up level-node clicks
    document.querySelectorAll('.level-node').forEach(node => {
        node.addEventListener('click', (e) => {
            const level = parseInt(node.dataset.level);
            playSound('pop', 800);
            currentDifficulty = level;
            
            switchView(viewGameSorting);
            initGame();
        });
    });

    function switchView(targetView) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        targetView.classList.add('active');
        if (targetView === viewDifficultyMenu) {
            _refreshMap();
        }
    }
    window.switchView = switchView;

    document.getElementById('btn-back-main').addEventListener('click', () => switchView(viewMenu));
    document.getElementById('btn-back-main-lit').addEventListener('click', () => switchView(viewMenu));
    document.getElementById('btn-back-menu').addEventListener('click', () => switchView(viewDifficultyMenu));

    document.getElementById('btn-play-again').addEventListener('click', () => {
        document.getElementById('message-overlay').classList.add('hidden');
        initGame();
    });

    // Touch defaults preventions just to be extremely aggressive
    document.addEventListener('touchmove', (e) => {
        // Prevent default touch behaviors like bounce, rubberband
        if(e.cancelable) e.preventDefault();
    }, { passive: false });

    // --- SENSORY FEEDBACK ENGINES ---

    // 1. Audio Synthesis (Web Audio API)
    let audioCtx = null;
    
    function playSound(type, freqOrPitch) {
        try {
            if (!audioCtx) return;
            if (audioCtx.state === 'suspended') audioCtx.resume();

            if (type === 'pop') {
                // Quick gentle bubble pop — two layered sine tones
                const osc1 = audioCtx.createOscillator();
                const osc2 = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc1.connect(gain); osc2.connect(gain);
                gain.connect(audioCtx.destination);
                osc1.type = 'sine';
                osc2.type = 'sine';
                osc1.frequency.setValueAtTime(freqOrPitch || 600, audioCtx.currentTime);
                osc1.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.12);
                osc2.frequency.setValueAtTime((freqOrPitch || 600) * 1.5, audioCtx.currentTime);
                osc2.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                osc1.start(); osc2.start();
                osc1.stop(audioCtx.currentTime + 0.15);
                osc2.stop(audioCtx.currentTime + 0.15);
            } else if (type === 'ding') {
                // Bright ascending major chord — C, E, G layered
                const baseFreq = freqOrPitch || 523;
                [1, 1.25, 1.5].forEach((ratio, i) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain); gain.connect(audioCtx.destination);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(baseFreq * ratio, audioCtx.currentTime);
                    gain.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
                    osc.start(audioCtx.currentTime + i * 0.05);
                    osc.stop(audioCtx.currentTime + 0.8);
                });
            } else if (type === 'boink') {
                // Soft descending minor tone — gentle "nope"
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.25);
                gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.3);
            }
        } catch(e) { console.log("Audio API failed:", e); }
    }
    window.playSound = playSound;

    // 2. Voiceover — uses pre-generated local MP3 files for consistent quality
    let _currentFeedbackAudio = null;

    // Map text phrases to local audio file keys
    const _feedbackMap = {
        'יפה': 'praise_1',
        'יפה!': 'praise_1',
        'מצוין': 'praise_2',
        'מצוין!': 'praise_2',
        'נהדר': 'praise_3',
        'נהדר!': 'praise_3',
        'כל הכבוד': 'praise_4',
        'כל הכבוד!': 'praise_4',
        'כל הכבוד! הצלחת!': 'praise_win',
        'נסה שוב': 'wrong_1',
        'אוי, נסה שוב': 'wrong_1',
        'אוי, לא פה': 'wrong_2',
        'הסל מלא': 'wrong_full',
        'זה לא שייך לפה!': 'wrong_not_here',
        'זה לא שייך לפה': 'wrong_not_here',
        'אחת': 'count_1',
        'שתיים': 'count_2',
        'שלוש': 'count_3',
        'ארבע': 'count_4',
        'חמש': 'count_5',
    };

    // Called INSIDE a user gesture to pre-load audio for Android
    function _unlockAndPreloadTTS() {
        // Pre-load all feedback audio files
        Object.values(_feedbackMap).forEach(key => {
            try {
                const audio = new Audio(`assets/audio/feedback_${key}.mp3`);
                audio.preload = 'auto';
                audio.load();
            } catch(e) {}
        });
    }

    function speak(text) {
        if (!text) return;

        // Stop any currently playing feedback
        if (_currentFeedbackAudio) {
            _currentFeedbackAudio.pause();
            _currentFeedbackAudio.currentTime = 0;
        }

        const key = _feedbackMap[text];
        if (key) {
            _currentFeedbackAudio = new Audio(`assets/audio/feedback_${key}.mp3`);
            _currentFeedbackAudio.play().catch(e => console.log('Feedback audio blocked:', e));
        } else {
            console.log('No feedback audio for:', text);
        }
    }
    window.speak = speak;

    // 3. Visual Confetti System
    function triggerConfetti() {
        const colors = ['#ff69b4', '#87cefa', '#32cd32', '#ffd700', '#ff4500'];
        for(let i=0; i<30; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti-particle');
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.animationDelay = (Math.random() * 0.5) + 's';
            document.body.appendChild(confetti);
            
            // Cleanup
            setTimeout(() => confetti.remove(), 4000);
        }
    }
    window.triggerConfetti = triggerConfetti;

    // Game Logic
    let currentDraggedItem = null;
    let itemsLeftToSorted = 0;

    const spawnArea = document.getElementById('spawning-area');
    const dropZonesArea = document.getElementById('drop-zones-area');
    let dropZones = [];

    const colorPool = [
        { id: 'red',    hex: '#e53935', circle: '🔴', label: 'אדום',   basketEmoji: '🟥', items: [
            { emoji: '🍓' }, { emoji: '🍎' }, { emoji: '🌹' }, { emoji: '🚒' }, { emoji: '❤️' }
        ]},
        { id: 'blue',   hex: '#1e88e5', circle: '🔵', label: 'כחול',  basketEmoji: '🟦', items: [
            { emoji: '💧' }, { emoji: '🐳' }, { emoji: '📘' }, { emoji: '🔷' }, { emoji: '🧢' }
        ]},
        { id: 'green',  hex: '#43a047', circle: '🟢', label: 'ירוק',  basketEmoji: '🟩', items: [
            { emoji: '🍀' }, { emoji: '🥦' }, { emoji: '🐍' }, { emoji: '🍏' }, { emoji: '🌿' }
        ]},
        { id: 'orange', hex: '#fb8c00', circle: '🟠', label: 'כתום',  basketEmoji: '🟧', items: [
            { emoji: '🍊' }, { emoji: '🥕' }, { emoji: '🦊' }, { emoji: '🏀' }, { emoji: '🍑' }
        ]},
        { id: 'purple', hex: '#8e24aa', circle: '🟣', label: 'סגול',  basketEmoji: '🟪', items: [
            { emoji: '🍇' }, { emoji: '🪻' }, { emoji: '🔮' }, { emoji: '🫐' }, { emoji: '💜' }
        ]},
        { id: 'yellow', hex: '#fdd835', circle: '🟡', label: 'צהוב',  basketEmoji: '🟨', items: [
            { emoji: '🌻' }, { emoji: '⭐' }, { emoji: '🍋' }, { emoji: '🐤' }, { emoji: '🌕' }
        ]},
        { id: 'pink',   hex: '#e91e8c', circle: '🩷', label: 'ורוד',  basketEmoji: '🩷', items: [
            { emoji: '🌸' }, { emoji: '🐷' }, { emoji: '🎀' }, { emoji: '🌷' }, { emoji: '🦩' }
        ]}
    ];

    const shapesConfig = [
        { emoji: '🟢', shape: 'circle' }, { emoji: '⚽', shape: 'circle' }, { emoji: '🟡', shape: 'circle' },
        { emoji: '🟦', shape: 'square' }, { emoji: '🎁', shape: 'square' }, { emoji: '📦', shape: 'square' },
        { emoji: '🔺', shape: 'triangle' }, { emoji: '🍕', shape: 'triangle' }, { emoji: '⛺', shape: 'triangle' }
    ];

    const shapeBasketEmojis = { 'circle': '⭕', 'square': '🔲', 'triangle': '📐' };

    // Category pool — pick two at random each game
    const categoryPool = [
        { id: 'animal',  label: 'חיות',     basket: '🐾', items: [
            { emoji: '🐶' }, { emoji: '🐱' }, { emoji: '🐮' }, { emoji: '🐸' }, { emoji: '🐘' }
        ]},
        { id: 'vehicle', label: 'כלי רכב', basket: '🛣️', items: [
            { emoji: '🚗' }, { emoji: '🚓' }, { emoji: '🚁' }, { emoji: '🚀' }, { emoji: '🚢' }
        ]},
        { id: 'fruit',   label: 'פירות',   basket: '🍽️', items: [
            { emoji: '🍌' }, { emoji: '🍉' }, { emoji: '🍒' }, { emoji: '🍑' }, { emoji: '🥝' }
        ]},
        { id: 'space',   label: 'חלל',     basket: '🌌', items: [
            { emoji: '🌙' }, { emoji: '⭐' }, { emoji: '🪐' }, { emoji: '☄️' }, { emoji: '🛸' }
        ]},
        { id: 'sea',     label: 'ים',      basket: '🌊', items: [
            { emoji: '🐟' }, { emoji: '🦀' }, { emoji: '🐙' }, { emoji: '🐚' }, { emoji: '🦭' }
        ]}
    ];

    // Distractors — shared across all category games
    const distractors = [
        { emoji: '🥦', category: 'distractor' }, { emoji: '🎸', category: 'distractor' },
        { emoji: '👟', category: 'distractor' }, { emoji: '☎️', category: 'distractor' },
        { emoji: '🪑', category: 'distractor' }, { emoji: '🎩', category: 'distractor' }
    ];

    function _pickRandom(arr, n) {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }

    function initGame() {
        spawnArea.innerHTML = '';
        dropZonesArea.innerHTML = '';
        dropZones = [];
        currentDraggedItem = null;
        itemsLeftToSorted = 0;
        
        // ---- Pick game elements for this round ----
        let activeColors = [];    // for Level 1/2: array of colorPool entries
        let activeCategories = []; // for Level 4: array of categoryPool entries
        let featureKey = 'color';
        let itemsToSpawn = [];

        if (currentDifficulty === 4) {
            // Level 4: pick 2 random categories
            featureKey = 'category';
            activeCategories = _pickRandom(categoryPool, 2);
        } else if (currentDifficulty === 3) {
            featureKey = 'shape';
        } else {
            // Level 1 / 2: pick 2 random colors
            featureKey = 'color';
            activeColors = _pickRandom(colorPool, 2);
        }

        const basketsConfig = {};

        // ---- Build Drop Zones ----
        if (currentDifficulty === 4) {
            activeCategories.forEach(cat => {
                basketsConfig[cat.id] = { targetCount: null, currentCount: 0 };

                const zone = document.createElement('div');
                zone.classList.add('drop-zone');
                zone.dataset.category = cat.id;

                // Basket emoji
                const basketEl = document.createElement('div');
                basketEl.classList.add('basket');
                basketEl.textContent = cat.basket;
                zone.appendChild(basketEl);

                // Label
                const lbl = document.createElement('div');
                lbl.classList.add('basket-label');
                lbl.textContent = cat.label;
                zone.appendChild(lbl);

                const counter = document.createElement('div');
                counter.classList.add('basket-counter', 'hidden');
                zone.appendChild(counter);

                dropZonesArea.appendChild(zone);
                dropZones.push(zone);
            });

        } else if (currentDifficulty === 3) {
            ['circle', 'square', 'triangle'].forEach(shape => {
                basketsConfig[shape] = { targetCount: null, currentCount: 0 };

                const zone = document.createElement('div');
                zone.classList.add('drop-zone');
                zone.dataset.shape = shape;

                const basketEl = document.createElement('div');
                basketEl.classList.add('basket');
                basketEl.textContent = shapeBasketEmojis[shape];
                zone.appendChild(basketEl);

                const counter = document.createElement('div');
                counter.classList.add('basket-counter', 'hidden');
                zone.appendChild(counter);

                dropZonesArea.appendChild(zone);
                dropZones.push(zone);
            });

        } else {
            // Level 1 / 2: color baskets
            activeColors.forEach(colorDef => {
                const targetCount = currentDifficulty === 2 ? Math.floor(Math.random() * 3) + 2 : null;
                basketsConfig[colorDef.id] = { targetCount, currentCount: 0 };

                const zone = document.createElement('div');
                zone.classList.add('drop-zone', 'color-box');
                zone.dataset.color = colorDef.id;

                // The zone IS the colored container — full solid color
                zone.style.background    = colorDef.hex;
                zone.style.borderColor   = 'rgba(0,0,0,0.25)';
                zone.style.boxShadow     = `0 10px 0 rgba(0,0,0,0.2), 0 14px 20px rgba(0,0,0,0.15)`;

                if (currentDifficulty === 2) {
                    zone.dataset.target  = targetCount;
                    zone.dataset.current = 0;
                    // Counter badge inside the colored box
                    const counter = document.createElement('div');
                    counter.classList.add('basket-counter');
                    counter.textContent = `0/${targetCount}`;
                    zone.appendChild(counter);
                }

                dropZonesArea.appendChild(zone);
                dropZones.push(zone);
            });
        }

        // ---- Spawn Items ----
        if (currentDifficulty === 4) {
            activeCategories.forEach(cat => {
                _pickRandom(cat.items, 3).forEach(item =>
                    itemsToSpawn.push({ emoji: item.emoji, category: cat.id, color: '', shape: '' })
                );
            });
            // Add 2 random distractors
            _pickRandom(distractors, 2).forEach(d => itemsToSpawn.push({ ...d, color: '', shape: '' }));
            itemsToSpawn.sort(() => 0.5 - Math.random());
            itemsLeftToSorted = itemsToSpawn.filter(i => i.category !== 'distractor').length;

        } else if (currentDifficulty === 3) {
            ['circle', 'square', 'triangle'].forEach(shape => {
                const avail = shapesConfig.filter(i => i.shape === shape);
                _pickRandom(avail, 2).forEach(i => itemsToSpawn.push({ ...i, color: '', category: '' }));
            });
            itemsToSpawn.sort(() => 0.5 - Math.random());
            itemsLeftToSorted = itemsToSpawn.length;

        } else if (currentDifficulty === 1) {
            // Pick 2 random items per color (4 total)
            activeColors.forEach(colorDef => {
                _pickRandom(colorDef.items, 2).forEach(item =>
                    itemsToSpawn.push({ emoji: item.emoji, color: colorDef.id, shape: '', category: '' })
                );
            });
            itemsToSpawn.sort(() => 0.5 - Math.random());
            itemsLeftToSorted = itemsToSpawn.length;

        } else {
            // Level 2: exact target counts per color
            activeColors.forEach(colorDef => {
                const target = basketsConfig[colorDef.id].targetCount;
                const avail = colorDef.items;
                for (let i = 0; i < target; i++) {
                    const item = avail[Math.floor(Math.random() * avail.length)];
                    itemsToSpawn.push({ emoji: item.emoji, color: colorDef.id, shape: '', category: '' });
                }
            });
            itemsToSpawn.sort(() => 0.5 - Math.random());
            itemsLeftToSorted = itemsToSpawn.length;
        }

        // Give DOM a frame to compute layout
        requestAnimationFrame(() => {
            const rect = spawnArea.getBoundingClientRect();
            
            itemsToSpawn.forEach((item) => {
                const el = document.createElement('div');
                el.classList.add('draggable-item');
                el.textContent = item.emoji; // revert to emoji
                el.dataset.color = item.color || '';
                el.dataset.shape = item.shape || '';
                el.dataset.category = item.category || '';
                
                // Keep padding from edges (e.g. 50px buffer)
                const pad = 50; 
                let maxX = rect.width - pad * 2;
                let maxY = rect.height - pad * 2;
                if(maxX < 0) maxX = 50;
                if(maxY < 0) maxY = 50;

                const startX = pad + Math.random() * maxX;
                const startY = pad + Math.random() * maxY;

                el.style.left = startX + 'px';
                el.style.top = startY + 'px';
                
                // Store original coords for snapping back
                el.dataset.startX = startX;
                el.dataset.startY = startY;

                // Add Pointer Event Listeners
                el.addEventListener('pointerdown', handlePointerDown);
                el.addEventListener('pointermove', handlePointerMove);
                el.addEventListener('pointerup', handlePointerUp);
                el.addEventListener('pointercancel', handlePointerUp);

                spawnArea.appendChild(el);
            });
        });
    }

    function handlePointerDown(e) {
        e.preventDefault(); // prevent mouse emulation and selection
        currentDraggedItem = e.currentTarget;
        currentDraggedItem.classList.add('dragging');
        currentDraggedItem.setPointerCapture(e.pointerId);

        playSound('pop', 400); // Sensory feedback on grab
        moveItemToCursor(currentDraggedItem, e.clientX, e.clientY);
    }

    function handlePointerMove(e) {
        e.preventDefault();
        if (currentDraggedItem !== e.currentTarget) return;
        
        moveItemToCursor(currentDraggedItem, e.clientX, e.clientY);
    }

    function handlePointerUp(e) {
        if (currentDraggedItem !== e.currentTarget) return;
        currentDraggedItem.classList.remove('dragging');
        currentDraggedItem.releasePointerCapture(e.pointerId);

        const dropX = e.clientX;
        const dropY = e.clientY;

        const matchedZone = findOverlappingDropZone(dropX, dropY);

        let matchFound = false;
        if (matchedZone) {
            
            // Distractor Logic: If it's a distractor and dropped in ANY zone, immediately reject
            if (currentDraggedItem.dataset.category === 'distractor') {
                playSound('boink', 300);
                speak("זה לא שייך לפה!"); // "This doesn't belong here"
                bounceBack(currentDraggedItem);
                
                // Add a brief red error flash to the zone
                const originalBorder = matchedZone.style.borderColor;
                matchedZone.style.borderColor = 'red';
                setTimeout(() => matchedZone.style.borderColor = originalBorder, 500);
                return;
            }

            if (currentDifficulty === 4 && matchedZone.dataset.category === currentDraggedItem.dataset.category) {
                matchFound = true;
            } else if (currentDifficulty === 3 && matchedZone.dataset.shape === currentDraggedItem.dataset.shape) {
                matchFound = true;
            } else if (currentDifficulty !== 3 && currentDifficulty !== 4 && matchedZone.dataset.color === currentDraggedItem.dataset.color) {
                matchFound = true;
            }
        }

        if (matchFound) {
            
            let isItemAccepted = true;

            // Level 2 Logic: Check if basket is already full
            if (currentDifficulty === 2) {
                let current = parseInt(matchedZone.dataset.current);
                let target = parseInt(matchedZone.dataset.target);
                
                if (current < target) {
                    current++;
                    matchedZone.dataset.current = current;
                    
                    const counterEl = matchedZone.querySelector('.basket-counter');
                    counterEl.textContent = `${current}/${target}`;
                    
                    if (current === target) {
                        counterEl.classList.add('complete');
                    }
                } else {
                    // Basket is full, reject item
                    isItemAccepted = false;
                }
            }

            if (isItemAccepted) {
                // Success condition
                playSound('ding', 800 + (Math.random() * 400)); // Happy variable plink
                speak(''); // interrupt any errors
                snapToZoneCenter(currentDraggedItem, matchedZone);
                currentDraggedItem.classList.add('success');
                
                // Disable further interactions on this item
                currentDraggedItem.removeEventListener('pointerdown', handlePointerDown);
                currentDraggedItem.removeEventListener('pointermove', handlePointerMove);
                currentDraggedItem.removeEventListener('pointerup', handlePointerUp);
                currentDraggedItem.removeEventListener('pointercancel', handlePointerUp);
                
                itemsLeftToSorted--;
                if (itemsLeftToSorted <= 0) {
                    // All items sorted — victory!
                    playSound('ding', 1200);
                    setTimeout(()=>playSound('ding', 1600), 200);
                    speak("כל הכבוד! הצלחת!");
                    triggerConfetti();
                    _recordLevelWin(currentDifficulty); // save star to level map

                    setTimeout(() => {
                        document.getElementById('message-overlay').classList.remove('hidden');
                    }, 1000);
                } else {
                    // Say a number if Level 2, or generic praise if Level 1
                    if(currentDifficulty === 2) {
                        const current = parseInt(matchedZone.dataset.current);
                        const hebNumbers = ["אחת", "שתיים", "שלוש", "ארבע", "חמש"];
                        speak(hebNumbers[current - 1] || "יפה");
                    } else {
                        const praises = ["יפה", "מצוין", "נהדר"];
                        speak(praises[Math.floor(Math.random() * praises.length)]);
                    }
                }
            } else {
                // Failure condition (Basket Full) - smoothly return to starting point
                playSound('boink');
                speak("הסל מלא"); // "The basket is full"
                bounceBack(currentDraggedItem);
            }
        } else {
            // Failure condition (Wrong zone or no zone) - smoothly return
            if(dropY < window.innerHeight / 2) { 
                // Only sound boink if they actually tried dropping near the top half (drop zones)
                playSound('boink');
                speak("אוי, נסה שוב"); // "Oops, try again"
            }
            bounceBack(currentDraggedItem);
        }

        currentDraggedItem = null;
    }

    function bounceBack(item) {
        item.style.left = item.dataset.startX + 'px';
        item.style.top = item.dataset.startY + 'px';
    }

    // Helper functions
    function moveItemToCursor(item, clientX, clientY) {
        // Convert screen coordinates to coordinates relative to .spawning-area
        const rect = spawnArea.getBoundingClientRect();
        const localX = clientX - rect.left;
        const localY = clientY - rect.top;

        item.style.left = localX + 'px';
        item.style.top = localY + 'px';
    }

    function findOverlappingDropZone(clientX, clientY) {
        for (let zone of dropZones) {
            const rect = zone.getBoundingClientRect();
            // A simple box boundary collision checking if the finger touch point is inside the zone
            if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
                return zone;
            }
        }
        return null;
    }

    function snapToZoneCenter(item, zone) {
        // Find dead center of the zone and place the item there relative to the spawn area
        const zoneRect = zone.getBoundingClientRect();
        const spawnRect = spawnArea.getBoundingClientRect();
        
        // Add a tiny random offset so items don't stack perfectly on top of each other,
        // letting toddlers see they actually put multiple items in
        const offsetRange = 30; // pixels
        const randomX = (Math.random() - 0.5) * offsetRange;
        const randomY = (Math.random() - 0.5) * offsetRange;

        const zoneCenterX = zoneRect.left + (zoneRect.width / 2) + randomX;
        const zoneCenterY = zoneRect.top + (zoneRect.height / 2) + randomY;

        const localX = zoneCenterX - spawnRect.left;
        const localY = zoneCenterY - spawnRect.top;

        item.style.left = localX + 'px';
        item.style.top = localY + 'px';
    }
});
