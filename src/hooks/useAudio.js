import { getCharHex } from '../constants';

let audioCtx = null;
let currentVoiceAudio = null;
let currentPhoneticAudio = null;
let musicInterval = null;
let noteIndex = 0;
let isSpeakingCallback = null;

// Simple C-major arpeggio melody for gentle music-box background music
const melody = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]; // C4 - E4 - G4 - C5 - G4 - E4

const feedbackMap = {
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

// Auto-preload audio elements
const preloadedAudio = {};

export function initAudioEngine() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // Preload feedback voiceovers
    Object.keys(feedbackMap).forEach(text => {
        const fileKey = feedbackMap[text];
        if (!preloadedAudio[fileKey]) {
            const audio = new Audio(`./assets/audio/feedback_${fileKey}.mp3`);
            audio.preload = 'auto';
            audio.load();
            preloadedAudio[fileKey] = audio;
        }
    });

    // Start background music automatically on initialization
    startBackgroundMusic();
}

export function startBackgroundMusic() {
    if (musicInterval) return;
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Play a gentle arpeggio arround 1.5 seconds intervals
    musicInterval = setInterval(() => {
        try {
            if (audioCtx.state === 'suspended') return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sine'; // very pure soft wave
            osc.frequency.setValueAtTime(melody[noteIndex], audioCtx.currentTime);
            
            // Set extremely low background volume (toy-piano feel)
            gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 1.2);
            
            noteIndex = (noteIndex + 1) % melody.length;
        } catch (e) {
            // handle silent fail
        }
    }, 1500);
}

export function stopBackgroundMusic() {
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
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

    const fileKey = feedbackMap[text];
    if (fileKey) {
        let audio = preloadedAudio[fileKey];
        if (!audio) {
            audio = new Audio(`./assets/audio/feedback_${fileKey}.mp3`);
            preloadedAudio[fileKey] = audio;
        }
        audio.currentTime = 0;
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
        // TTS Fallback
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'he-IL';
            utterance.rate = 0.85; 
            utterance.onstart = () => {
                if (isSpeakingCallback) isSpeakingCallback(true);
            };
            utterance.onend = () => {
                if (isSpeakingCallback) isSpeakingCallback(false);
            };
            utterance.onerror = () => {
                if (isSpeakingCallback) isSpeakingCallback(false);
            };
            window.speechSynthesis.speak(utterance);
        } else {
            console.log('Speech synthesis fallback failed:', text);
        }
    }
}

export function playLetterName(char) {
    stopVoice();
    const hex = getCharHex(char);
    const audio = new Audio(`./assets/audio/name_${hex}.mp3`);
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
