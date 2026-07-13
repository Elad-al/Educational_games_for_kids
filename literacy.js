(function() {
    let currentStage = 1;
    let draggedElement = null;
    let isDragging = false;
    let lastTapTime = 0;
    let animationFrameId = null;

    // Elements
    const btnBack = document.getElementById('btn-back-menu-lit');
    const stage1 = document.getElementById('lit-stage-1');
    const stage2 = document.getElementById('lit-stage-2');
    const stage3 = document.getElementById('lit-stage-3');
    const particlesContainer = document.getElementById('lit-particles-container');

    // Stage 1 Elements
    const dragLetter = document.getElementById('lit-drag-letter');
    const silhouette = document.getElementById('lit-target-silhouette');

    // Stage 2 Elements
    const star = document.getElementById('lit-dist-star');
    const cloud = document.getElementById('lit-dist-cloud');
    const seekLetter = document.getElementById('lit-seek-letter');

    // Stage 3 Elements
    const wand = document.getElementById('lit-wand-letter');
    const bed = document.getElementById('lit-obj-bed');
    const ball = document.getElementById('lit-obj-ball');
    const chair = document.getElementById('lit-obj-chair');

    // Overrides 'Play Again' button if we're in Literacy Game
    const overlay = document.getElementById('message-overlay');
    const playAgainBtn = document.getElementById('btn-play-again');

    function debounce(e) {
        const now = Date.now();
        if (now - lastTapTime < 300) {
            e.preventDefault();
            return true;
        }
        lastTapTime = now;
        return false;
    }

    // Initialize Game from map node
    window.initLiteracyGame = function(stageNum) {
        currentStage = stageNum;
        updateView();
        checkCompletionState();
        if (stageNum === 1) resetStage1();
        if (stageNum === 2) resetStage2();
        if (stageNum === 3) resetStage3();

        // Adjust play again button for Literacy (go back to literacy map)
        playAgainBtn.onclick = () => {
            overlay.classList.add('hidden');
            if (window.switchView && window.viewLiteracyMenu) {
                window.switchView(window.viewLiteracyMenu);
                checkCompletionState();
            }
        };
    };

    function checkCompletionState() {
        const s1 = localStorage.getItem('lit_stage_1') === 'true';
        const s2 = localStorage.getItem('lit_stage_2') === 'true';
        const s3 = localStorage.getItem('lit_stage_3') === 'true';
        
        const node2 = document.querySelector('.lit-level-node[data-lit-level="2"]');
        const node3 = document.querySelector('.lit-level-node[data-lit-level="3"]');
        
        if (s1) {
            document.getElementById('lit-stars-1').textContent = '⭐⭐⭐';
            if (node2) node2.classList.remove('locked');
        }
        if (s2) {
            document.getElementById('lit-stars-2').textContent = '⭐⭐⭐';
            if (node3) node3.classList.remove('locked');
        }
        if (s3) {
            document.getElementById('lit-stars-3').textContent = '⭐⭐⭐';
        }
    }

    // Wire up literacy level map nodes
    document.querySelectorAll('.lit-level-node').forEach(node => {
        node.addEventListener('click', (e) => {
            if (node.classList.contains('locked')) {
                if (window.playSound) window.playSound('boink', 300);
                return;
            }
            if (debounce(e)) return;
            const level = parseInt(node.dataset.litLevel);
            if (window.playSound) window.playSound('pop', 800);
            
            if (window.switchView && window.viewGameLiteracy) {
                window.switchView(window.viewGameLiteracy);
            }
            window.initLiteracyGame(level);
        });
    });

    btnBack.addEventListener('click', (e) => {
        if(debounce(e)) return;
        if (window.playSound) window.playSound('pop', 800);
        checkCompletionState(); // update map just in case
        
        // Restore play again btn behavior for main game
        playAgainBtn.onclick = () => {
            overlay.classList.add('hidden');
            if (window.initGame) window.initGame();
        };

        if (window.switchView && window.viewLiteracyMenu) {
            window.switchView(window.viewLiteracyMenu);
        }
    });

    function updateView() {
        [stage1, stage2, stage3].forEach(el => {
            el.classList.remove('active');
            el.classList.add('hidden');
        });

        if (currentStage === 1) {
            stage1.classList.remove('hidden');
            setTimeout(() => stage1.classList.add('active'), 50);
        } else if (currentStage === 2) {
            stage2.classList.remove('hidden');
            setTimeout(() => stage2.classList.add('active'), 50);
        } else if (currentStage === 3) {
            stage3.classList.remove('hidden');
            setTimeout(() => stage3.classList.add('active'), 50);
        }
    }

    // --- LITERACY DATA ---
    const hebrewLetters = [
        { char: 'א', name: 'אָלֶף' },
        { char: 'ב', name: 'בֵּית' },
        { char: 'ג', name: 'גִּימֶל' },
        { char: 'ד', name: 'דָּלֶת' },
        { char: 'ה', name: 'הֵא' },
        { char: 'ו', name: 'וָו' },
        { char: 'ז', name: 'זַיִן' },
        { char: 'ח', name: 'חֵית' },
        { char: 'ט', name: 'טֵית' },
        { char: 'י', name: 'יוֹד' },
        { char: 'כ', name: 'כַּף' },
        { char: 'ל', name: 'לָמֶד' },
        { char: 'מ', name: 'מֵם' },
        { char: 'נ', name: 'נוּן' },
        { char: 'ס', name: 'סָמֶךְ' },
        { char: 'ע', name: 'עַיִן' },
        { char: 'פ', name: 'פֵּא' },
        { char: 'צ', name: 'צָדִי' },
        { char: 'ק', name: 'קוֹף' },
        { char: 'ר', name: 'רֵישׁ' },
        { char: 'ש', name: 'שִׁין' },
        { char: 'ת', name: 'תָּו' }
    ];

    function getCharHex(char) {
        return encodeURIComponent(char).replace(/%/g, '').toLowerCase();
    }

    let currentLetterInfo = null;
    let nameAudio = null;
    let phoneticAudio = null;

    function stopPhonetic() {
        if (phoneticAudio) {
            phoneticAudio.pause();
            phoneticAudio.currentTime = 0;
        }
    }

    function resetStage1() {
        let debugInput = document.getElementById('lit-debug-input');
        let debugChar = debugInput ? debugInput.value.trim() : "";
        let forcedInfo = hebrewLetters.find(l => l.char === debugChar);

        if (forcedInfo) {
            currentLetterInfo = forcedInfo;
        } else {
            // Pick a random letter
            currentLetterInfo = hebrewLetters[Math.floor(Math.random() * hebrewLetters.length)];
        }
        
        const hex = getCharHex(currentLetterInfo.char);
        
        // Preload Name Audio
        if (nameAudio) { nameAudio.pause(); }
        nameAudio = new Audio(`assets/audio/name_${hex}.mp3`);

        // Preload Phonetic Audio simply
        if (phoneticAudio) { phoneticAudio.pause(); }
        phoneticAudio = new Audio(`assets/audio/phonetic_${hex}.mp3?v=4`);

        // Update UI
        dragLetter.textContent = currentLetterInfo.char;
        silhouette.textContent = currentLetterInfo.char;
        
        dragLetter.classList.remove('success', 'dragging');
        
        // Spawn randomly in the bottom half (away from target)
        const randomX = Math.floor(20 + Math.random() * 60);
        const randomY = Math.floor(65 + Math.random() * 25);
        dragLetter.style.left = randomX + '%';
        dragLetter.style.top = randomY + '%';
        dragLetter.dataset.originX = dragLetter.style.left;
        dragLetter.dataset.originY = dragLetter.style.top;
        
        dragLetter.style.transform = 'translate(-50%, -50%)';
        dragLetter.style.transition = 'left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }

    dragLetter.addEventListener('pointerdown', (e) => {
        if (debounce(e)) return;
        draggedElement = dragLetter;
        isDragging = true;
        
        dragLetter.classList.add('dragging');
        dragLetter.setPointerCapture(e.pointerId);
        dragLetter.style.transition = 'none';
        
        if (phoneticAudio) {
            phoneticAudio.currentTime = 0;
            phoneticAudio.play().catch(e => console.log('Phonetic audio play blocked', e));
        }
    });

    document.addEventListener('pointermove', (e) => {
        if (!isDragging || !draggedElement) return;
        e.preventDefault();

        // Use requestAnimationFrame for 60FPS dragging
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => {
            const container = document.getElementById('game-literacy');
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            draggedElement.style.left = x + 'px';
            draggedElement.style.top = y + 'px';

            if (currentStage === 3) {
                createMagicDust(x, y);
            }
        });
    });

    document.addEventListener('pointerup', (e) => {
        if (!isDragging || !draggedElement) return;
        isDragging = false;
        
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        draggedElement.classList.remove('dragging');
        draggedElement.releasePointerCapture(e.pointerId);

        if (currentStage === 1 && draggedElement === dragLetter) {
            stopPhonetic();

            checkDropTarget(e.clientX, e.clientY);
        } else if (currentStage === 3 && draggedElement === wand) {
            checkWandCollision(e.clientX, e.clientY);
        }
        
        draggedElement = null;
    });

    function checkDropTarget(x, y) {
        const targetRect = silhouette.getBoundingClientRect();
        const hitPadding = 80; // Forgiving drop zone
        
        if (x > targetRect.left - hitPadding && x < targetRect.right + hitPadding &&
            y > targetRect.top - hitPadding && y < targetRect.bottom + hitPadding) {
            
            // Success!
            const stageRect = stage1.getBoundingClientRect();
            dragLetter.style.transition = 'left 0.2s, top 0.2s';
            dragLetter.style.left = (targetRect.left + targetRect.width / 2 - stageRect.left) + 'px';
            dragLetter.style.top = (targetRect.top + targetRect.height / 2 - stageRect.top) + 'px';
            
            dragLetter.classList.add('success');
            
            // Play ding + voice praise
            if (window.playSound) window.playSound('ding', 1000);
            const praises = ['יפה', 'מצוין', 'נהדר', 'כל הכבוד'];
            if (window.speak) window.speak(praises[Math.floor(Math.random() * praises.length)]);

            // Play formal name after a short delay so praise is heard first
            setTimeout(() => {
                if (nameAudio) {
                    nameAudio.currentTime = 0;
                    nameAudio.play().catch(err => console.log('Name audio blocked', err));
                }
            }, 800);
            if (window.triggerConfetti) window.triggerConfetti();

            // Loop to next letter endlessly after delay
            setTimeout(() => {
                resetStage1();
            }, 2500);

        } else {
            // Miss: Return with soft spring
            dragLetter.style.transition = 'left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            dragLetter.style.left = dragLetter.dataset.originX || '50%';
            dragLetter.style.top = dragLetter.dataset.originY || '85%';
            if (window.playSound) window.playSound('boink', 300);
            if (window.speak) window.speak('נסה שוב');
        }
    }

    // --- STAGE 2 LOGIC ---
    function resetStage2() {
        currentLetterInfo = hebrewLetters[Math.floor(Math.random() * hebrewLetters.length)];
        const hex = getCharHex(currentLetterInfo.char);
        if (nameAudio) { nameAudio.pause(); }
        nameAudio = new Audio(`assets/audio/name_${hex}.mp3`);
        
        seekLetter.textContent = currentLetterInfo.char;
        
        seekLetter.classList.remove('center-stage');
        star.classList.remove('wiggle');
        cloud.classList.remove('wiggle');
    }

    function handleDistractorTap(el) {
        if (window.playSound) window.playSound('boink', 300);
        if (window.speak) window.speak('נסה שוב');
        el.classList.remove('wiggle');
        // Trigger reflow
        void el.offsetWidth;
        el.classList.add('wiggle');
    }

    star.addEventListener('pointerdown', (e) => { if(!debounce(e)) handleDistractorTap(star); });
    cloud.addEventListener('pointerdown', (e) => { if(!debounce(e)) handleDistractorTap(cloud); });

    seekLetter.addEventListener('pointerdown', (e) => {
        if(debounce(e)) return;
        seekLetter.classList.add('center-stage');
        if (window.playSound) window.playSound('ding', 1000);
        
        const praises = ['יפה', 'מצוין', 'נהדר', 'כל הכבוד'];
        if (window.speak) window.speak(praises[Math.floor(Math.random() * praises.length)]);

        setTimeout(() => {
            if (nameAudio) {
                nameAudio.currentTime = 0;
                nameAudio.play().catch(err => console.log('Name audio blocked', err));
            }
        }, 800);
        if (window.triggerConfetti) window.triggerConfetti();

        setTimeout(() => {
            resetStage2();
        }, 2500);
    });

    // --- STAGE 3 LOGIC ---
    function resetStage3() {
        currentLetterInfo = hebrewLetters[Math.floor(Math.random() * hebrewLetters.length)];
        const hex = getCharHex(currentLetterInfo.char);
        if (nameAudio) { nameAudio.pause(); }
        nameAudio = new Audio(`assets/audio/name_${hex}.mp3`);
        
        wand.textContent = currentLetterInfo.char;
        
        wand.style.left = '50%';
        wand.style.top = '85%';
        bed.classList.remove('success-bounce', 'wiggle');
        ball.classList.remove('wiggle');
        chair.classList.remove('wiggle');
        particlesContainer.innerHTML = '';
    }

    wand.addEventListener('pointerdown', (e) => {
        if (debounce(e)) return;
        draggedElement = wand;
        isDragging = true;
        wand.classList.add('dragging');
        wand.setPointerCapture(e.pointerId);
    });

    function createMagicDust(x, y) {
        if (Math.random() > 0.4) return; // Limit particle density
        const particle = document.createElement('div');
        particle.classList.add('lit-magic-dust');
        particle.style.left = (x - 6) + 'px';
        particle.style.top = (y - 6) + 'px';
        particlesContainer.appendChild(particle);
        setTimeout(() => {
            if (particle.parentNode) particle.parentNode.removeChild(particle);
        }, 600);
    }

    function checkWandCollision(x, y) {
        const bedRect = bed.getBoundingClientRect();
        const ballRect = ball.getBoundingClientRect();
        const chairRect = chair.getBoundingClientRect();
        
        if (hitTest(x, y, ballRect)) {
            triggerObjectWiggle(ball);
        } else if (hitTest(x, y, chairRect)) {
            triggerObjectWiggle(chair);
        } else if (hitTest(x, y, bedRect)) {
            // Success!
            const stageRect = stage3.getBoundingClientRect();
            wand.style.left = (bedRect.left + bedRect.width/2 - stageRect.left) + 'px';
            wand.style.top = (bedRect.top - 20 - stageRect.top) + 'px'; // Float above bed
            
            bed.classList.add('success-bounce');
            if (window.playSound) {
                window.playSound('ding', 1200);
                setTimeout(() => window.playSound('ding', 1600), 200);
            }
            const praises = ['יפה', 'מצוין', 'נהדר', 'כל הכבוד'];
            if (window.speak) window.speak(praises[Math.floor(Math.random() * praises.length)]);

            setTimeout(() => {
                if (nameAudio) {
                    nameAudio.currentTime = 0;
                    nameAudio.play().catch(err => console.log('Name audio blocked', err));
                }
            }, 800);
            if (window.triggerConfetti) window.triggerConfetti();

            setTimeout(() => {
                resetStage3();
            }, 3000);
        } else {
            resetStage3();
        }
    }

    function hitTest(x, y, rect) {
        const hitPadding = 40;
        return (x > rect.left - hitPadding && x < rect.right + hitPadding &&
                y > rect.top - hitPadding && y < rect.bottom + hitPadding);
    }

    function triggerObjectWiggle(el) {
        if (window.playSound) window.playSound('boink', 250);
        if (window.speak) window.speak('נסה שוב');
        el.classList.remove('wiggle');
        void el.offsetWidth;
        el.classList.add('wiggle');
        resetStage3(); 
    }

    // Initialize map node state on first load
    document.addEventListener('DOMContentLoaded', () => {
        checkCompletionState();
    });

})();
