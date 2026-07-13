export const hebrewLetters = [
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

export function getCharHex(char) {
    return encodeURIComponent(char).replace(/%/g, '').toLowerCase();
}

export const colorPool = [
    { id: 'red', hex: '#ff5c5c', circle: '🔴', label: 'אדום', basketEmoji: '🟥', items: [
        { emoji: '🍓' }, { emoji: '🍎' }, { emoji: '🌹' }, { emoji: '🚒' }, { emoji: '❤️' }
    ]},
    { id: 'blue', hex: '#4ca3ff', circle: '🔵', label: 'כחול', basketEmoji: '🟦', items: [
        { emoji: '💧' }, { emoji: '🐳' }, { emoji: '📘' }, { emoji: '🔷' }, { emoji: 'Cap' }
    ]},
    { id: 'green', hex: '#5cd65c', circle: '🟢', label: 'ירוק', basketEmoji: '🟩', items: [
        { emoji: '🍀' }, { emoji: '🥦' }, { emoji: '🐍' }, { emoji: '🍏' }, { emoji: '🌿' }
    ]},
    { id: 'orange', hex: '#ffa34c', circle: '🟠', label: 'כתום', basketEmoji: '🟧', items: [
        { emoji: '🍊' }, { emoji: '🥕' }, { emoji: 'Fox' }, { emoji: '🏀' }, { emoji: '🍑' }
    ]},
    { id: 'purple', hex: '#c75cff', circle: '🟣', label: 'סגול', basketEmoji: '🟪', items: [
        { emoji: '🍇' }, { emoji: '🪻' }, { emoji: '🔮' }, { emoji: '🫐' }, { emoji: '💜' }
    ]},
    { id: 'yellow', hex: '#ffd633', circle: '🟡', label: 'צהוב', basketEmoji: '🟨', items: [
        { emoji: '🌻' }, { emoji: '⭐' }, { emoji: '🍋' }, { emoji: '🐤' }, { emoji: '🌕' }
    ]},
    { id: 'pink', hex: '#ff66b2', circle: '🩷', label: 'ורוד', basketEmoji: '🩷', items: [
        { emoji: '🌸' }, { emoji: '🐷' }, { emoji: '🎀' }, { emoji: '🌷' }, { emoji: '🦩' }
    ]}
];

// Note: Replace English placeholder letters with cute child friendly emojis
colorPool[1].items[4] = { emoji: '🧢' }; // Cap emoji
colorPool[3].items[2] = { emoji: '🦊' }; // Fox emoji

export const shapesConfig = [
    { emoji: '🟢', shape: 'circle' }, { emoji: '⚽', shape: 'circle' }, { emoji: '🟡', shape: 'circle' },
    { emoji: '🟦', shape: 'square' }, { emoji: '🎁', shape: 'square' }, { emoji: '📦', shape: 'square' },
    { emoji: '🔺', shape: 'triangle' }, { emoji: '🍕', shape: 'triangle' }, { emoji: '⛺', shape: 'triangle' }
];

export const shapeBasketEmojis = { 'circle': '⭕', 'square': '🔲', 'triangle': '📐' };

export const categoryPool = [
    { id: 'animal', label: 'חיות', basket: '🐾', items: [
        { emoji: '🐶' }, { emoji: '🐱' }, { emoji: '🐮' }, { emoji: '🐸' }, { emoji: '🐘' }
    ]},
    { id: 'vehicle', label: 'כלי רכב', basket: '🛣️', items: [
        { emoji: '🚗' }, { emoji: '🚓' }, { emoji: '🚁' }, { emoji: '🚀' }, { emoji: '🚢' }
    ]},
    { id: 'fruit', label: 'פירות', basket: '🍽️', items: [
        { emoji: '🍌' }, { emoji: '🍉' }, { emoji: '🍒' }, { emoji: '🍑' }, { emoji: '🥝' }
    ]},
    { id: 'space', label: 'חלל', basket: '🌌', items: [
        { emoji: '🌙' }, { emoji: '⭐' }, { emoji: '🪐' }, { emoji: '☄️' }, { emoji: '🛸' }
    ]},
    { id: 'sea', label: 'ים', basket: '🌊', items: [
        { emoji: '🐟' }, { emoji: '🦀' }, { emoji: '🐙' }, { emoji: '🐚' }, { emoji: '🦭' }
    ]}
];

export const distractors = [
    { emoji: '🥦', category: 'distractor' }, { emoji: '🎸', category: 'distractor' },
    { emoji: '👟', category: 'distractor' }, { emoji: '☎️', category: 'distractor' },
    { emoji: '🪑', category: 'distractor' }, { emoji: '🎩', category: 'distractor' }
];

export const stickerPool = [
    { id: 'bear', emoji: '🧸', name: 'דובי' },
    { id: 'balloon', emoji: '🎈', name: 'בלון' },
    { id: 'butterfly', emoji: '🦋', name: 'פרפר' },
    { id: 'unicorn', emoji: '🦄', name: 'חד קרן' },
    { id: 'dinosaur', emoji: '🦕', name: 'דינוזאור' },
    { id: 'car', emoji: '🏎️', name: 'מכונית' },
    { id: 'flower', emoji: '🌸', name: 'פרח' },
    { id: 'rocket', emoji: '🚀', name: 'חללית' },
    { id: 'rainbow', emoji: '🌈', name: 'קשת בענן' },
    { id: 'candy', emoji: '🍭', name: 'סוכרייה' },
    { id: 'icecream', emoji: '🍦', name: 'גלידה' },
    { id: 'sun', emoji: '☀️', name: 'שמש' }
];

export const stickerScenes = [
    { id: 'forest', name: 'יער קסום', background: 'linear-gradient(to top, #78ffd6, #a8ff78)' },
    { id: 'sky', name: 'שמיים כחולים', background: 'linear-gradient(to top, #c2e9fb, #a1c4fd)' },
    { id: 'space', name: 'חלל עמוק', background: 'linear-gradient(to top, #0f2027, #203a43, #2c5364)' },
    { id: 'ocean', name: 'מתחת למים', background: 'linear-gradient(to top, #00c6ff, #0072ff)' }
];
