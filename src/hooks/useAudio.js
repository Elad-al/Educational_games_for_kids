import { getCharHex } from '../constants';

let audioCtx = null;
let currentVoiceAudio = null;
let currentPhoneticAudio = null;

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

export function stopVoice() {
    if (currentVoiceAudio) {
        currentVoiceAudio.pause();
        currentVoiceAudio.currentTime = 0;
    }
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
        // Use preloaded element or load new
        let audio = preloadedAudio[fileKey];
        if (!audio) {
            audio = new Audio(`./assets/audio/feedback_${fileKey}.mp3`);
            preloadedAudio[fileKey] = audio;
        }
        audio.currentTime = 0;
        currentVoiceAudio = audio;
        audio.play().catch(e => console.log('Speech playback blocked', e));
    } else {
        console.log('No speech audio found for phrase:', text);
    }
}

export function playLetterName(char) {
    stopVoice();
    const hex = getCharHex(char);
    const audio = new Audio(`./assets/audio/name_${hex}.mp3`);
    currentVoiceAudio = audio;
    
    return new Promise((resolve) => {
        audio.onended = () => resolve();
        audio.play().catch(err => {
            console.log('Letter name audio blocked', err);
            resolve(); // Resolve immediately on block to let game proceed
        });
        // Safety timeout
        setTimeout(resolve, 1500);
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

export function useAudio() {
    return {
        initAudioEngine,
        playSfx,
        speak,
        playLetterName,
        playLetterPhonetic,
        stopVoice,
        stopPhonetic
    };
}
