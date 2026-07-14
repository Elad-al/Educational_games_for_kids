import { getCharHex } from '../constants';

let audioCtx = null;
let currentVoiceAudio = null;
let currentPhoneticAudio = null;
let musicInterval = null;
let noteIndex = 0;
let isSpeakingCallback = null;
let laughInterval = null;
const laughAudio = new Audio('/assets/audio/generated/kids_laughing.mp3');

// Upbeat bouncy pentatonic melody for background music
const melody = [261.63, 329.63, 392.00, 523.25, 659.25, 523.25, 392.00, 329.63]; // C4 - E4 - G4 - C5 - E5 - C5 - G4 - E4

const textToKey = {
    "נסה שוב": "try_again",
    "אוי, נסה שוב": "oh_try_again",
    "הסל מלא": "basket_full",
    "זה לא שייך לפה!": "not_here",
    "זה לא שייך לפה": "not_here",

    // Fix 2: feminine win phrase
    "כל הכבוד! הצלחת!": "success",   // keep old key mapping to new file
    "כל הכבוד! את אלופה!": "success", // new feminine phrase → same file

    "יפה!": "praise_1", "יפה": "praise_1",
    "מצוין!": "praise_2", "מצוין": "praise_2",
    "נהדר!": "praise_3", "נהדר": "praise_3",
    "כל הכבוד!": "praise_4", "כל הכבוד": "praise_4",

    "אחת": "num_1", "שתיים": "num_2", "שלוש": "num_3", "ארבע": "num_4", "חמש": "num_5",

    // Literacy feedback
    "אוי, נסה לגרור אל צללית האות!": "lit_wrong_shadow",
    "נסה לחפש אות אחרת!": "lit_wrong_find",
    "אוי, החפץ הזה מתחיל באות אחרת!": "lit_wrong_wand",

    // Fix 4: Stage 1 multi-target
    "גרור כל אות אל הצללית המתאימה!": "s1_multi_instr",
    "יופי! עכשיו שתי אותיות בבת אחת!": "s1_phase2",
    "מדהים! עכשיו שלוש אותיות!": "s1_phase3",
    "וואו! עכשיו קשה יותר, שימי לב!": "s1_phase4",

    // Sorting Game
    "גרור כל צעצוע לסל בצבע המתאים! לחץ על הסל להסבר": "sort_intro_1",
    "מיין את הצעצועים לפי מספרים וצבעים! לחץ על הסל להסבר": "sort_intro_2",
    "מיין את הצורות לסלים המתאימים! לחץ על הסל להסבר": "sort_intro_3",
    "מיין את הצעצועים! שים לב, חלק מהפריטים לא שייכים!": "sort_intro_4",
    "הסל הזה כבר מלא!": "sort_full",
    "אוי, נסה לגרור למקום אחר!": "sort_try_other"
};

const colors = ['אדום', 'כחול', 'ירוק', 'כתום', 'סגול', 'צהוב', 'ורוד'];
colors.forEach(c => textToKey[`גרור לכאן את כל הצעצועים בצבע ${c}!`] = `sort_color_${c}`);

const shapes = ['עיגולים', 'ריבועים', 'משולשים'];
shapes.forEach(s => textToKey[`גרור לכאן את כל ה${s}!`] = `sort_shape_${s}`);

const cats = ['חיות', 'כלי רכב', 'פירות', 'חלל', 'ים'];
cats.forEach(c => textToKey[`גרור לכאן את כל ה${c}!`] = `sort_cat_${c}`);

// Also keeping the old generic mapping just in case
const categories = [
    'פירות', 'חיות', 'כלי רכב', 'בגדים', 'צעצועים',
    'רהיטים', 'אוכל', 'כלי עבודה', 'כלי נגינה', 'כלי כתיבה'
];
categories.forEach(cat => textToKey[`גרור את ה${cat} לסל!`] = `sort_${cat}`);

const hebrew_letters = "אבגדהוזחטיכלמנסעפצקרשתץףןםך";
for (let char of hebrew_letters) {
    textToKey[`גרור את האות ${char} למקום הנכון!`] = `lit_${char}`;
    textToKey[`גרור את האות סופית ${char} למקום הנכון!`] = `lit_${char}`; // aliases
    textToKey[`גרור את האות ${char} אל הצללית שלה!`] = `lit_shadow_${char}`;
    textToKey[`איפה האות ${char}?`] = `lit_find_${char}`;
    textToKey[`גרור את השרביט אל החפץ שמתחיל באות ${char}!`] = `lit_wand_${char}`;
    textToKey[`זאת האות ${char}, נסה שוב!`] = `wrong_letter_${char}`;
}

const objects = ['מיטה', 'כדור', 'בית', 'שמש', 'פרח', 'ספר'];
const letters = ['מ', 'כ', 'ב', 'ש', 'פ', 'ס'];
for (let obj of objects) {
    for (let letter of letters) {
        textToKey[`זה ${obj}, אם זה מתחיל באות ${letter} הזז את השרביט לכאן`] = `obj_desc_${obj}_${letter}`;
    }
}
for (let i = 0; i < objects.length; i++) {
    textToKey[`זה ${objects[i]}, זה מתחיל באות ${letters[i]}. נסה שוב!`] = `wrong_wand_${objects[i]}`;
}

// Auto-preload audio elements
const preloadedAudio = {};

export function initAudioEngine() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    startBackgroundMusic();
}

export function startBackgroundMusic() {
    if (musicInterval) return;
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Play a happy bouncy melody
    musicInterval = setInterval(() => {
        try {
            if (audioCtx.state === 'suspended') return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'triangle'; // more bouncy and distinct than sine
            osc.frequency.setValueAtTime(melody[noteIndex], audioCtx.currentTime);
            
            // Set upbeat envelope
            gain.gain.setValueAtTime(0.0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.015, audioCtx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
            
            noteIndex = (noteIndex + 1) % melody.length;
        } catch (e) {
            // handle silent fail
        }
    }, 400);

    // Play kids laughing every 30 seconds
    if (!laughInterval) {
        laughInterval = setInterval(() => {
            laughAudio.volume = 0.4;
            laughAudio.play().catch(() => {});
        }, 30000);
    }
}

export function stopBackgroundMusic() {
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
    if (laughInterval) {
        clearInterval(laughInterval);
        laughInterval = null;
    }
}

export function playSfx(type, freqOverride) {
    try {
        if (!audioCtx) {
            initAudioEngine();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const time = audioCtx.currentTime;

        if (type === 'pop') {
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(audioCtx.destination);

            osc1.type = 'sine';
            osc2.type = 'sine';

            const pitch = freqOverride || 600;
            osc1.frequency.setValueAtTime(pitch, time);
            osc1.frequency.exponentialRampToValueAtTime(200, time + 0.12);

            osc2.frequency.setValueAtTime(pitch * 1.5, time);
            osc2.frequency.exponentialRampToValueAtTime(300, time + 0.1);

            gain.gain.setValueAtTime(0.35, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

            osc1.start(time);
            osc2.start(time);
            osc1.stop(time + 0.15);
            osc2.stop(time + 0.15);
        } else if (type === 'ding') {
            const baseFreq = freqOverride || 523; // C5
            const ratios = [1, 1.25, 1.5]; // C, E, G
            ratios.forEach((ratio, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(baseFreq * ratio, time);
                gain.gain.setValueAtTime(0.2, time + i * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.8);

                osc.start(time + i * 0.05);
                osc.stop(time + 0.8);
            });
        } else if (type === 'boink') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, time);
            osc.frequency.exponentialRampToValueAtTime(180, time + 0.25);

            gain.gain.setValueAtTime(0.25, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

            osc.start(time);
            osc.stop(time + 0.3);
        }
    } catch (e) {
        console.error("Audio API synthesis failed:", e);
    }
}

// Sparkly magic arpeggio sound effect
export function playSparkle() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            playSfx('ding', 523 + i * 150);
        }, i * 80);
    }
}

// Cheerful bubbly giggle sound effect
export function playGiggle() {
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            playSfx('pop', 700 + Math.sin(i) * 200);
        }, i * 60);
    }
}

export function stopVoice() {
    if (currentVoiceAudio) {
        currentVoiceAudio.pause();
        currentVoiceAudio.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    if (isSpeakingCallback) isSpeakingCallback(false);
}

export function stopPhonetic() {
    if (currentPhoneticAudio) {
        currentPhoneticAudio.pause();
        currentPhoneticAudio.currentTime = 0;
    }
}

export function speak(text) {
    if (!text) return;
    stopVoice();

    const fileKey = textToKey[text];
    if (fileKey) {
        let audio = preloadedAudio[fileKey];
        if (!audio) {
            audio = new Audio(`./assets/audio/generated/${fileKey}.mp3`);
            preloadedAudio[fileKey] = audio;
        }
        audio.currentTime = 0;
        
        // Pitch shift up for a cute "baby" voice
        audio.preservesPitch = false;
        audio.playbackRate = 1.35;
        
        currentVoiceAudio = audio;
        if (isSpeakingCallback) isSpeakingCallback(true);
        audio.onended = () => {
            if (isSpeakingCallback) isSpeakingCallback(false);
        };
        audio.play().catch(e => {
            console.log('Speech playback blocked', e);
            if (isSpeakingCallback) isSpeakingCallback(false);
        });
    } else {
        console.warn('Unmapped text, falling back to TTS without pitch control:', text);
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'he-IL';
            
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(v => v.lang.includes('he') && v.name.toLowerCase().includes('female'));
            if (femaleVoice) utterance.voice = femaleVoice;
            
            utterance.onstart = () => {
                if (isSpeakingCallback) isSpeakingCallback(true);
            };
            utterance.onend = () => {
                if (isSpeakingCallback) isSpeakingCallback(false);
            };
            window.speechSynthesis.speak(utterance);
        }
    }
}

export function playLetterName(char) {
    stopVoice();
    const hex = getCharHex(char);
    const audio = new Audio(`./assets/audio/name_${hex}.mp3`);
    
    audio.preservesPitch = false;
    audio.playbackRate = 1.35;
    
    currentVoiceAudio = audio;
    
    return new Promise((resolve) => {
        audio.onended = () => {
            if (isSpeakingCallback) isSpeakingCallback(false);
            resolve();
        };
        if (isSpeakingCallback) isSpeakingCallback(true);
        audio.play().catch(err => {
            console.log('Letter name audio blocked', err);
            if (isSpeakingCallback) isSpeakingCallback(false);
            resolve();
        });
        setTimeout(() => {
            if (isSpeakingCallback) isSpeakingCallback(false);
            resolve();
        }, 1500);
    });
}

export function playLetterPhonetic(char) {
    stopPhonetic();
    const hex = getCharHex(char);
    const audio = new Audio(`./assets/audio/phonetic_${hex}.mp3?v=4`);
    
    audio.preservesPitch = false;
    audio.playbackRate = 1.35;
    
    currentPhoneticAudio = audio;
    audio.loop = true;
    audio.play().catch(e => console.log('Letter phonetic blocked', e));
    return audio;
}

export function registerSpeakingListener(callback) {
    isSpeakingCallback = callback;
}

export function useAudio() {
    return {
        initAudioEngine,
        playSfx,
        playSparkle,
        playGiggle,
        speak,
        playLetterName,
        playLetterPhonetic,
        stopVoice,
        stopPhonetic,
        startBackgroundMusic,
        stopBackgroundMusic,
        registerSpeakingListener
    };
}
